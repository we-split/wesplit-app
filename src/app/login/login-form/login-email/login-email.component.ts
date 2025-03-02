import { Component, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import {
  ReactiveFormsModule,
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import {
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import { Router } from '@angular/router';
import { AuthenticationService } from '../../../../shared/authentication.service';
import { LocalizationService } from '../../../../shared/localization.service';
import { calculateFormValidationErrors } from '../../../../utils/FormValidators';
import { debounceTime } from 'rxjs/operators';
import { TranslocoDirective } from '@ngneat/transloco';
import { SpinnerComponent } from '../../../base-elements/spinner/spinner.component';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatButton } from '@angular/material/button';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-login-modal',
  templateUrl: './login-email.component.html',
  styleUrls: ['./login-email.component.scss'],
  standalone: true,
  imports: [
    TranslocoDirective,
    MatDialogTitle,
    SpinnerComponent,
    MatDialogContent,
    ReactiveFormsModule,
    MatFormField,
    MatLabel,
    MatInput,
    MatDialogActions,
    MatButton,
    AsyncPipe,
  ],
})
export class LoginEmailComponent implements OnInit {
  loading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  loginForm!: UntypedFormGroup;

  isPasswordWrong = false;
  formErrors: string[] = [];

  constructor(
    private formBuilder: UntypedFormBuilder,
    public dialogRef: MatDialogRef<LoginEmailComponent>,
    private router: Router,
    private authService: AuthenticationService,
    private localizationService: LocalizationService
  ) {}

  ngOnInit(): void {
    this.loginForm = this.formBuilder.group(
      {
        email: ['', Validators.compose([Validators.required, Validators.email])],
        password: [
          '',
          Validators.compose([
            Validators.required,
            Validators.maxLength(32),
            Validators.minLength(6),
          ]),
        ],
      },
      {}
    );

    const translation = this.localizationService.getTranslationSection('form');

    this.loginForm.valueChanges.pipe(debounceTime(200)).subscribe(() => {
      this.formErrors = [];
      this.isPasswordWrong = false;

      this.formErrors = calculateFormValidationErrors(this.loginForm, translation);
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.loading$.next(true);

      const { email, password } = this.loginForm.value;

      this.authService
        .loginWitEmailAndPassword(email, password)
        .then(async result => await this.successLogin(result.user.uid))
        .catch(err => {
          if (err.code == 'auth/wrong-password') {
            this.isPasswordWrong = true;
          }

          if (err.code == 'auth/user-not-found') {
            this.loading$.next(true);

            this.authService
              .createUserWithEmailAndPassword(email, password)
              .then(async result => await this.successLogin(result.user.uid))
              .catch(console.error);
          }
        })
        .finally(() => this.loading$.next(false));
    }
  }

  async successLogin(uid: string) {
    localStorage.setItem('uid', uid);

    this.loading$.next(false);
    this.dialogRef.close();

    await this.router.navigate(['/events']);
  }

  onCancel() {
    this.dialogRef.close();
  }
}
