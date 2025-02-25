import { Component, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { AuthenticationService } from '../../../../shared/authentication.service';
import { LocalizationService } from '../../../../shared/localization.service';
import { calculateFormValidationErrors } from '../../../../utils/FormValidators';
import { debounceTime } from 'rxjs/operators';

@Component({
  selector: 'app-login-modal',
  templateUrl: './login-email.component.html',
  styleUrls: ['./login-email.component.scss'],
})
export class LoginEmailComponent implements OnInit {
  loading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  loginForm!: UntypedFormGroup;

  isPasswordWrong: boolean = false;
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
