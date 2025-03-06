import { Component } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AuthenticationService } from '../../../shared/authentication.service';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { NotificationService } from '../../../shared/notification.service';
import { LocalizationService } from '../../../shared/localization.service';
import isPwa from '../../../utils/PwaExtensions';
import { LoginEmailComponent } from './login-email/login-email.component';
import { Location } from '@angular/common';
import { TranslocoDirective } from '@ngneat/transloco';
import { SidenavLayoutComponent } from '../../base-elements/layouts/sidenav-layout/sidenav-layout.component';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-login-form',
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.scss'],
  standalone: true,
  imports: [TranslocoDirective, SidenavLayoutComponent, MatIconButton, MatIcon, MatButton],
})
export class LoginFormComponent {
  loading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  constructor(
    public authService: AuthenticationService,
    private router: Router,
    private dialog: MatDialog,
    private localizationService: LocalizationService,
    private notificationService: NotificationService,
    private location: Location
  ) {}

  async loginWithService(service = '') {
    this.loading$.next(true);

    if (isPwa()) {
      setTimeout(() => this.loading$.next(false), 5000);
    }

    await this.authService
      .loginWithService(service)
      .then(async result => {
        localStorage.setItem('uid', result.user.uid);
        await this.router.navigate(['/events']);
      })
      .catch(err => {
        console.error(err);

        if (
          [
            'auth/network-request-failed',
            'auth/popup-closed-by-user',
            'auth/cancelled-popup-request',
          ].includes(err.code)
        ) {
          this.loading$.next(false);

          this.notificationService.open(
            this.localizationService.translate('auth.login.popupClosedByUser')
          );
        }
      })
      .finally(() => this.loading$.next(false));
  }

  openLoginModal() {
    this.dialog.open(LoginEmailComponent, {
      width: '350px',
    });
  }

  onBack() {
    this.location.back();
  }
}
