import { Component, OnInit } from '@angular/core';
import {
  ReactiveFormsModule,
  UntypedFormArray,
  UntypedFormBuilder,
  UntypedFormControl,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { DataService } from '../../../shared/data.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { EventDto, Purchase, PurchaseMember } from '../../../models/Event';
import { EventActionCreator } from '../../../utils/EventActionCreator';
import { minMembersCountInPurchase, sumGreaterZero } from '../../../utils/FormValidators';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../base-elements/confirm-dialog/confirm-dialog.component';
import { TranslocoDirective } from '@ngneat/transloco';
import { LayoutComponent } from '../../base-elements/layouts/layout/layout.component';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { FormErrorsComponent } from '../../base-elements/form-errors/form-errors.component';
import { MatFormField, MatLabel, MatSuffix } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import {
  MatDatepicker,
  MatDatepickerInput,
  MatDatepickerToggle,
} from '@angular/material/datepicker';
import { MatSelect } from '@angular/material/select';
import { MatOption, provideNativeDateAdapter } from '@angular/material/core';
import { SeparatorComponent } from '../../base-elements/separator/separator.component';
import { GreyTitleComponent } from '../../base-elements/grey-title/grey-title.component';
import { MatCheckbox } from '@angular/material/checkbox';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'purchase-form',
  templateUrl: './purchase-form.component.html',
  styleUrls: ['./purchase-form.component.scss'],
  standalone: true,
  imports: [
    TranslocoDirective,
    LayoutComponent,
    MatIconButton,
    RouterLink,
    MatIcon,
    FormErrorsComponent,
    ReactiveFormsModule,
    MatFormField,
    MatLabel,
    MatInput,
    MatDatepickerInput,
    MatDatepickerToggle,
    MatSuffix,
    MatDatepicker,
    MatSelect,
    MatOption,
    SeparatorComponent,
    GreyTitleComponent,
    MatCheckbox,
    MatButton,
    AsyncPipe,
  ],
  providers: [provideNativeDateAdapter()],
})
export class PurchaseFormComponent implements OnInit {
  loading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  isEdit!: boolean;
  eventId!: string;
  purchaseId!: string;

  event$!: Observable<EventDto>;
  event!: EventDto;
  purchase!: Purchase;
  purchaseForm!: UntypedFormGroup;

  constructor(
    private dataService: DataService,
    private eventActionCreator: EventActionCreator,
    private formBuilder: UntypedFormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loading$.next(true);

    this.isEdit = this.route.snapshot.data['isEdit'];
    this.eventId = this.route.snapshot.paramMap.get('id') ?? '';
    this.purchaseId = this.route.snapshot.paramMap.get('purchaseId') ?? '';

    const isEditMode = this.isEdit && this.hasRePayedDebts;

    this.purchaseForm = this.formBuilder.group(
      {
        title: ['', Validators.required],
        date: new UntypedFormControl({
          value: new Date(),
          disabled: isEditMode,
        }),
        payer: new UntypedFormControl(
          {
            value: '',
            disabled: isEditMode,
          },
          Validators.required
        ),
        sum: new UntypedFormControl(
          { value: 0, disabled: isEditMode },
          Validators.compose([Validators.required])
        ),
        members: this.formBuilder.array([]),
      },
      {
        validators: [sumGreaterZero(), minMembersCountInPurchase()],
      }
    );

    this.event$ = this.dataService.getEventById(this.eventId);

    this.event$.subscribe(
      event => {
        this.event = event;

        if (this.isEdit && this.purchaseId) {
          this.fillFormFromEvent();
        } else {
          this.purchaseForm.patchValue({
            payer: this.dataService.getCurrentUser(this.eventId),
          });

          this.checkAllMembers(true);
        }
      },
      () => console.error,
      () => this.loading$.next(false)
    );
  }

  get members(): UntypedFormArray {
    return this.purchaseForm.get('members') as UntypedFormArray;
  }

  get hasRePayedDebts(): boolean {
    return this.event?.rePayedDebts?.length > 0;
  }

  fillFormFromEvent() {
    const purchase = this.event.purchases.find(x => x.id === this.purchaseId);

    if (purchase) {
      this.purchase = purchase;

      this.purchaseForm.patchValue({
        title: purchase.title,
        date: new Date(purchase.date),
        payer: purchase.payer,
        sum: purchase.sum,
      });

      this.fillFormArray(
        this.event.members.map(name =>
          this.formBuilder.group({
            name,
            selected: purchase.members.some(x => x === name),
          })
        )
      );

      if (this.hasRePayedDebts) {
        this.purchaseForm.controls['date'].disable();
        this.purchaseForm.controls['sum'].disable();
        this.purchaseForm.controls['payer'].disable();

        this.members.controls.forEach(control => {
          control.disable();
        });
      }
    }
  }

  checkAllMembers(selected: boolean) {
    this.fillFormArray(this.event.members.map(name => this.formBuilder.group({ name, selected })));
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fillFormArray(config: any) {
    this.purchaseForm.setControl('members', this.formBuilder.array(config || []));
  }

  mapPurchase(): Purchase {
    const { title, date, payer, sum } = this.purchaseForm.value as Purchase;

    if (this.hasRePayedDebts && this.isEdit) {
      return {
        title,
        date: new Date(date).getTime(),
        payer: this.purchase.payer,
        sum: this.purchase.sum,
        members: this.purchase.members,
      };
    }

    const dto = {
      date: new Date(date).getTime(),
      title,
      payer,
      sum,
      members: this.members?.value
        .filter((x: PurchaseMember) => x.selected)
        .map((x: PurchaseMember) => x.name),
    };

    return dto;
  }

  async onSubmit() {
    if (this.purchaseForm.valid) {
      this.loading$.next(true);

      const purchase = this.mapPurchase();

      if (this.isEdit && this.purchaseId) {
        await this.dataService.updatePurchase(this.event.id, this.purchaseId, purchase);

        await this.onChange();
      } else {
        await this.dataService.addPurchase(this.eventId, purchase);

        const currentUser = this.dataService.getCurrentUser(this.event.id);
        const action = this.eventActionCreator.addPurchase(
          currentUser,
          purchase.title,
          Number(purchase.sum)
        );

        await this.dataService.addEventAction(this.eventId, action);
        await this.onChange();
      }
    }
  }

  async onDeletePurchase() {
    let dialogRef: MatDialogRef<ConfirmDialogComponent, unknown> | null = this.dialog.open(
      ConfirmDialogComponent,
      {
        disableClose: false,
      }
    );

    await dialogRef.afterClosed().subscribe(async result => {
      if (result) {
        this.loading$.next(true);
        await this.dataService.deletePurchase(this.eventId, this.purchaseId);

        const currentUser = this.dataService.getCurrentUser(this.eventId);
        const action = await this.eventActionCreator.deletePurchase(
          currentUser,
          this.purchase.title
        );

        await this.dataService.addEventAction(this.eventId, action);
        await this.onChange();
      }

      dialogRef = null;
    });
  }

  async onChange() {
    this.loading$.next(false);
    await this.router.navigate(['/', 'events', this.eventId]);
  }
}
