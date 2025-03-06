import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import {
  ReactiveFormsModule,
  UntypedFormArray,
  UntypedFormBuilder,
  UntypedFormControl,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { debounceTime, pairwise, take } from 'rxjs/operators';
import { DataService } from '../../../shared/data.service';
import { ActionTypes, Event, EventDto, EventMember } from '../../../models/Event';
import { setLocalEvents, setOrganizerToLocalEvent } from '../../../utils/EventLocalStorage';
import {
  duplicateMembersValidator,
  notDeleteMemberExistedInPurchase,
  organizerInMembersValidation,
} from '../../../utils/FormValidators';
import { utc } from 'moment';
import { BehaviorSubject } from 'rxjs';
import { ConfirmDialogComponent } from '../../base-elements/confirm-dialog/confirm-dialog.component';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { AuthenticationService } from '../../../shared/authentication.service';
import { Location } from '@angular/common';
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
import { SeparatorComponent } from '../../base-elements/separator/separator.component';
import { GreyTitleComponent } from '../../base-elements/grey-title/grey-title.component';
import { provideNativeDateAdapter } from '@angular/material/core';

@Component({
  selector: 'event-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './event-form.component.html',
  styleUrls: ['./event-form.component.scss'],
  standalone: true,
  imports: [
    TranslocoDirective,
    LayoutComponent,
    MatIconButton,
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
    SeparatorComponent,
    GreyTitleComponent,
    MatButton,
  ],
  providers: [provideNativeDateAdapter()],
})
export class EventFormComponent implements OnInit {
  loading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  isEdit!: boolean;
  eventId!: string;
  event!: EventDto;
  eventForm!: UntypedFormGroup;
  hasRePayedDebts = false;

  constructor(
    private formBuilder: UntypedFormBuilder,
    private dataService: DataService,
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private dialog: MatDialog,
    private authService: AuthenticationService
  ) {}

  ngOnInit(): void {
    this.eventForm = this.formBuilder.group(
      {
        name: ['', Validators.required],
        date: new UntypedFormControl(new Date()),
        organizer: ['', Validators.required],
        members: this.formBuilder.array([]),
      },
      {
        validators: [organizerInMembersValidation(), duplicateMembersValidator()],
      }
    );

    this.isEdit = this.route.snapshot.data['isEdit'];
    this.eventId = this.route.snapshot.paramMap.get('id') ?? '';

    if (this.isEdit && this.eventId) {
      this.loading$.next(true);

      this.dataService
        .getEventById(this.eventId)
        .pipe(take(1))
        .subscribe(x => {
          this.event = x;
          this.fillFormFromEvent();
          this.subscribeMembersChanges();
          this.eventForm.addValidators(notDeleteMemberExistedInPurchase(this.event));

          this.hasRePayedDebts = x.rePayedDebts?.length > 0;
          if (this.hasRePayedDebts) {
            this.eventForm.disable();
            this.eventForm.controls['name'].enable();

            this.members.controls.forEach(control => {
              control.disable();
            });
          }

          this.loading$.next(false);
        });
    } else {
      this.subscribeMembersChanges();
    }
  }

  get members(): UntypedFormArray {
    return this.eventForm.get('members') as UntypedFormArray;
  }

  async onBack() {
    this.location.back();
  }

  fillFormFromEvent() {
    const { name, date, organizer, members } = this.event;

    this.eventForm.patchValue({
      name,
      organizer,
      date: new Date(date),
    });

    this.fillFormArray(
      members.filter(x => x !== organizer).map(name => this.formBuilder.group({ name })) || []
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fillFormArray(config: any) {
    this.eventForm.setControl('members', this.formBuilder.array(config || []));
  }

  subscribeMembersChanges() {
    this.members?.valueChanges
      .pipe(debounceTime(100), pairwise())
      .subscribe(([prev, curr]: [EventMember[], EventMember[]]) => {
        if (prev[prev.length - 1].name === '' && curr[curr.length - 1].name !== '') {
          this.addMember();
        }

        this.removeEmptyMembers(curr);
      });

    this.addMember();
  }

  removeEmptyMembers(members: EventMember[]) {
    members
      .map(({ name }, i) => (name === '' && i != members.length - 1 ? i : null))
      .forEach(n => {
        if (n !== null) {
          this.members.removeAt(n);
        }
      });
  }

  addMember() {
    const newMember = this.formBuilder.group({ name: '' });
    this.members.push(newMember);
  }

  async onSubmit() {
    if (this.eventForm.valid) {
      this.loading$.next(true);

      const { name, date, organizer, members } = this.eventForm.value;

      const event: Event = {
        ownerUserId: this.authService.currentUserId,
        id: '',
        name,
        organizer,
        date: utc(date).valueOf(),
        members: [
          organizer,
          ...this.members.value
            .filter((n: EventMember) => n.name !== '')
            .map((x: EventMember) => x.name),
        ],
      };

      if (this.isEdit && this.eventId) {
        event.id = this.eventId;

        await this.dataService.updateEvent(event).then(async () => {
          await this.onChange(this.eventId, event.organizer);
        });
      } else {
        await this.dataService
          .addEvent(event)
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .then(async (res: any) => {
            const id = res._key.path.segments[res._key.path.segments.length - 1];

            [
              {
                type: ActionTypes.CreateEvent,
                manager: organizer,
                date: utc().valueOf(),
              },
              {
                type: ActionTypes.AddMembersToEvent,
                manager: organizer,
                eventMembersCount: members.length,
                date: utc().valueOf(),
              },
            ].forEach(action => this.dataService.addEventAction(id, action));

            await this.onChange(id, event.organizer, true);
          })
          .catch(console.error)
          .finally(() => this.loading$.next(false));
      }
    }
  }

  async onChange(id: string, organizer: string, isCreated = false) {
    setOrganizerToLocalEvent(id, organizer);

    await this.router.navigate(['/', 'events', id], { state: { isCreated } });
  }

  async onDeleteEvent() {
    let dialogRef: MatDialogRef<ConfirmDialogComponent, unknown> | null = this.dialog.open(
      ConfirmDialogComponent,
      {
        disableClose: false,
      }
    );

    await dialogRef.afterClosed().subscribe(async result => {
      if (result) {
        this.loading$.next(true);

        await this.dataService
          .deleteEvent(this.eventId)
          .then(async () => {
            setLocalEvents([]);
            await this.router.navigate(['/events']);
          })
          .catch(console.error)
          .finally(() => this.loading$.next(true));
      }

      dialogRef = null;
    });
  }
}
