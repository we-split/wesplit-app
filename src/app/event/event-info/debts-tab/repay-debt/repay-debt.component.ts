import { Component, Inject, OnInit } from '@angular/core';
import { DebtDto } from '../../../../../models/Event';
import {
  ReactiveFormsModule,
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { sumGreaterZero, sumLessOrEqualDebt } from '../../../../../utils/FormValidators';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import { DataService } from '../../../../../shared/data.service';
import { EventActionCreator } from '../../../../../utils/EventActionCreator';
import { BehaviorSubject } from 'rxjs';
import { LocalizationService } from '../../../../../shared/localization.service';
import { CurrencyService } from '../../../../../shared/currency.service';
import { TranslocoDirective } from '@ngneat/transloco';
import { MatIcon } from '@angular/material/icon';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatButton } from '@angular/material/button';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'repay-debt',
  templateUrl: './repay-debt.component.html',
  styleUrls: ['./repay-debt.component.scss'],
  standalone: true,
  imports: [
    TranslocoDirective,
    MatDialogTitle,
    MatDialogContent,
    MatIcon,
    ReactiveFormsModule,
    MatFormField,
    MatLabel,
    MatInput,
    MatDialogActions,
    MatButton,
    AsyncPipe,
  ],
})
export class RepayDebtComponent implements OnInit {
  loading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  rePayDebtForm!: UntypedFormGroup;

  constructor(
    private dataService: DataService,
    private eventActionCreator: EventActionCreator,
    private formBuilder: UntypedFormBuilder,
    private dialogRef: MatDialogRef<RepayDebtComponent>,
    @Inject(MAT_DIALOG_DATA) public payload: DebtDto,
    private localizationService: LocalizationService,
    public currencyService: CurrencyService
  ) {}

  ngOnInit(): void {
    this.rePayDebtForm = this.formBuilder.group(
      {
        sum: [this.payload.debt.sum || 0, Validators.compose([Validators.required])],
      },
      {
        validators: [sumGreaterZero(), sumLessOrEqualDebt(this.payload.debt.sum)],
      }
    );
  }

  async onSubmit() {
    if (this.rePayDebtForm.valid) {
      this.loading$.next(true);
      this.rePayDebtForm.disable();

      const event = this.payload.event;
      const debt = this.payload.debt;
      const currentUser = this.payload.currentUser;
      const currentDebtSum = this.rePayDebtForm.value.sum;

      const action =
        Math.abs(currentDebtSum) === debt.sum
          ? this.eventActionCreator.giveBack(currentUser, debt.from, currentDebtSum)
          : this.eventActionCreator.giveBackPartially(currentUser, debt.from, currentDebtSum);

      Promise.all([
        this.dataService.addEventAction(event.id, action),

        this.dataService.updateRePayedDebt(event.id, {
          sum: Number(currentDebtSum),
          name: this.getName(debt.from),
        }),

        this.dataService.updateRePayedDebt(event.id, {
          sum: Number(currentDebtSum) * -1,
          name: this.getName(debt.to),
        }),
      ])
        .then(() => {
          this.dialogRef.close();
          location.reload();
        })
        .catch(console.error)
        .finally(() => this.loading$.next(false));
    }
  }

  getName(name: string): string {
    const youText = this.localizationService.translate('common.you');
    return name.replace(` (${youText})`, '');
  }

  onCancel() {
    this.dialogRef.close();
  }

  get hasErrorSumLessOrEqualDebt() {
    return Boolean(this.rePayDebtForm.errors?.['sumLessOrEqualDebt']);
  }
}
