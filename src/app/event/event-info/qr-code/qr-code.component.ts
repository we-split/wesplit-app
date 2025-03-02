import { AfterViewInit, Component, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Receipt, ReceiptPurchase } from '../../../../models/Receipt';
import { AuthenticationService } from '../../../../shared/authentication.service';
import { filter, take } from 'rxjs/operators';
import { Html5QrcodeScanner } from 'html5-qrcode';
import {
  ReactiveFormsModule,
  UntypedFormArray,
  UntypedFormBuilder,
  UntypedFormGroup,
} from '@angular/forms';
import { minLengthArray, minPurchaseInReceipt } from '../../../../utils/FormValidators';
import { EventAction, EventDto, Purchase } from '../../../../models/Event';
import { ActivatedRoute, Router } from '@angular/router';
import { DataService } from '../../../../shared/data.service';
import { utc } from 'moment';
import { LocalizationService } from '../../../../shared/localization.service';
import { EventActionCreator } from '../../../../utils/EventActionCreator';
import { Location } from '@angular/common';
import { TranslocoDirective } from '@ngneat/transloco';
import { LayoutComponent } from '../../../base-elements/layouts/layout/layout.component';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { FormErrorsComponent } from '../../../base-elements/form-errors/form-errors.component';
import { MatCheckbox } from '@angular/material/checkbox';

@Component({
  selector: 'app-qr-code',
  templateUrl: './qr-code.component.html',
  styleUrls: ['./qr-code.component.scss'],
  standalone: true,
  imports: [
    TranslocoDirective,
    LayoutComponent,
    MatIconButton,
    MatIcon,
    FormErrorsComponent,
    ReactiveFormsModule,
    MatCheckbox,
  ],
})
export class QrCodeComponent implements OnInit, AfterViewInit {
  loading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  eventId!: string;

  event!: EventDto;
  userToken!: string;

  qrCodeScanner!: Html5QrcodeScanner;
  isSuccessScan = false;

  receipt!: Receipt;
  receiptForm!: UntypedFormGroup;

  constructor(
    private router: Router,
    private httpClient: HttpClient,
    private authService: AuthenticationService,
    private formBuilder: UntypedFormBuilder,
    private activateRoute: ActivatedRoute,
    private dataService: DataService,
    private localizationService: LocalizationService,
    private eventActionCreator: EventActionCreator,
    private location: Location
  ) {}

  ngOnInit() {
    this.eventId = this.activateRoute.snapshot.params['id'];

    this.dataService
      .getEventById(this.eventId)
      .pipe(take(1))
      .subscribe(
        (event: EventDto) => {
          this.event = event;
        },
        err => console.error(err)
      );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.authService.currentUser$.pipe(filter(x => x != null)).subscribe((x: any) => {
      this.userToken = x.stsTokenManager.accessToken;
    });

    this.receiptForm = this.formBuilder.group(
      {
        purchases: this.formBuilder.array([]),
      },
      {
        validators: [minLengthArray(1, 'purchases'), minPurchaseInReceipt()],
      }
    );
  }

  ngAfterViewInit(): void {
    const config = {
      fps: 10,
      qrbox: {
        width: 120,
        height: 120,
      },
    };

    this.qrCodeScanner = new Html5QrcodeScanner('qr-reader', config, false);
    this.qrCodeScanner.render(this.onScanSuccess.bind(this), this.onScanFailure.bind(this));
  }

  get purchases(): UntypedFormArray {
    return this.receiptForm.get('purchases') as UntypedFormArray;
  }

  get receiptDate(): string {
    const lang = this.localizationService.getActiveLang();
    const date = this.receipt.date;

    return `${utc(date).locale(lang).format('DD MMMM')}, ${utc(date).locale(lang).format('dddd')}`;
  }

  get receiptTotalSum(): string {
    const summaryText = this.localizationService.translate('event.qr-receipt.summary');

    return `${summaryText}: ${this.receipt.totalSum}`;
  }

  onScanSuccess(decodedText: string) {
    if (this.isSuccessScan) {
      this.qrCodeScanner.clear();
    }

    this.loading$.next(true);
    this.isSuccessScan = true;

    const obj = decodeURI(decodedText)
      .replace(/"/g, '\\"')
      .replace(/&/g, '","')
      .replace(/=/g, '":"');

    const data = JSON.parse(`{ "${obj} "}`);

    const guestModeQueryParam = this.authService.isGuestMode ? '?questMode=true' : '';

    this.httpClient
      .post<Receipt>(`/api/check${guestModeQueryParam}`, data, {
        headers: {
          Authorization: 'Bearer ' + this.userToken,
        },
      })
      .subscribe(
        (res: Receipt) => {
          this.receipt = res;
          this.fillFormArray();
        },
        err => console.log(err),
        () => this.loading$.next(false)
      );
  }

  onScanFailure(error: string) {
    console.warn(`Code scan error = ${error}`);
  }

  fillFormArray() {
    const config = this.receipt.items.map(({ name, price, sum, quantity }) =>
      this.formBuilder.group({
        name,
        price,
        sum,
        quantity,
        selected: false,
      })
    );

    this.receiptForm.setControl('purchases', this.formBuilder.array(config || []));
  }

  async onBack() {
    await this.router.navigate(['/', 'events', this.eventId], {
      queryParams: { refresh: true },
    });
  }

  async onClose() {
    this.location.back();
  }

  async onSubmit() {
    if (this.receiptForm.valid) {
      this.loading$.next(true);

      const currentUser = this.dataService.getCurrentUser(this.eventId);

      const purchases = this.purchases?.value.filter((x: ReceiptPurchase) => x.selected);

      const eventPurchases = purchases.map((x: ReceiptPurchase) => {
        return {
          title: x.name,
          date: utc(this.receipt.date).valueOf(),
          payer: currentUser,
          sum: x.sum,
          members: this.event.members,
        };
      });

      const eventActions = purchases.map((x: ReceiptPurchase) =>
        this.eventActionCreator.addPurchase(currentUser, x.name, x.sum)
      );

      await Promise.all([
        ...eventPurchases.map(async (purchase: Purchase) => {
          await this.dataService.addPurchase(this.eventId, purchase);
        }),
        ...eventActions.map(async (eventAction: EventAction) => {
          await this.dataService.addEventAction(this.eventId, eventAction);
        }),
      ])
        .then(async () => await this.onBack())
        .finally(() => this.loading$.next(false));
    }
  }
}
