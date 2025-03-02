import { Component, Input } from '@angular/core';
import { PwaInstallComponent } from '../../pwa-install/pwa-install.component';
import { MatDialog } from '@angular/material/dialog';
import { BehaviorSubject } from 'rxjs';
import { AuthenticationService } from '../../../../shared/authentication.service';
import { Router, RouterLink } from '@angular/router';
import isPwa from '../../../../utils/PwaExtensions';
import { User } from '@angular/fire/auth';
import { TranslocoDirective } from '@ngneat/transloco';
import { MatSidenav, MatSidenavContainer, MatSidenavContent } from '@angular/material/sidenav';
import { MatList, MatListItem } from '@angular/material/list';
import { MatIcon } from '@angular/material/icon';
import { MatDivider } from '@angular/material/divider';
import { SpinnerComponent } from '../../spinner/spinner.component';
import { MatToolbar } from '@angular/material/toolbar';
import { MatIconButton } from '@angular/material/button';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-sidenav-layout',
  templateUrl: './sidenav-layout.component.html',
  styleUrls: ['./sidenav-layout.component.scss'],
  standalone: true,
  imports: [
    TranslocoDirective,
    MatSidenavContainer,
    MatSidenav,
    MatList,
    MatListItem,
    MatIcon,
    RouterLink,
    MatDivider,
    MatSidenavContent,
    SpinnerComponent,
    MatToolbar,
    MatIconButton,
    AsyncPipe,
  ],
})
export class SidenavLayoutComponent {
  @Input() loading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  opened = false;

  user!: User | null;

  constructor(
    public dialog: MatDialog,
    private router: Router,
    private authService: AuthenticationService
  ) {
    this.authService.currentUser$.subscribe(user => {
      this.user = user;
    });
  }

  isPwa() {
    return isPwa();
  }

  closeSidenav() {
    this.opened = false;
  }

  openPwaDialog(): void {
    this.dialog.open(PwaInstallComponent, {
      width: '80vw',
      height: '60vh',
    });
  }

  logout() {
    this.loading$.next(true);

    this.authService
      .logout()
      .then(async () => {
        await this.router.navigate(['/login']);
      })
      .catch(console.error)
      .finally(() => this.loading$.next(false));
  }
}
