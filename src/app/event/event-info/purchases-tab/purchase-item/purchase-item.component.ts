import { Component, Input } from '@angular/core';
import { EventDto, Purchase } from '../../../../../models/Event';
import { formatSum } from '../../../../../utils/Formatters';
import { LocalizationService } from '../../../../../shared/localization.service';
import { CurrencyService } from '../../../../../shared/currency.service';
import { utc } from 'moment';
import { TranslocoDirective } from '@ngneat/transloco';
import { RouterLink } from '@angular/router';
import { MatDivider } from '@angular/material/divider';

@Component({
  selector: 'purchase-item',
  templateUrl: './purchase-item.component.html',
  styleUrls: ['./purchase-item.component.scss'],
  standalone: true,
  imports: [TranslocoDirective, RouterLink, MatDivider],
})
export class PurchaseItemComponent {
  @Input() event!: EventDto;
  @Input() purchase!: Purchase;

  lang!: string;

  constructor(
    private localizationService: LocalizationService,
    public currencyService: CurrencyService
  ) {
    this.lang = this.localizationService.getActiveLang();
  }

  get purchaseSum(): string {
    return formatSum(this.lang, Number(this.purchase.sum));
  }

  get purchaseDate(): string {
    const date = this.purchase.date;
    const formattedDate = `${utc(date).locale(this.lang).format('DD MMMM')}`;

    return formattedDate;
  }

  get purchaseSubtitle(): string {
    const purchaseMembersCount = this.purchase.members.length;
    const eventMembersCount = this.event.members.length;

    const ofText = this.localizationService.translate('event.purchases.of');
    const participateText = this.localizationService.translate('event.purchases.participate');

    return purchaseMembersCount === 1
      ? `1 ${ofText} ${eventMembersCount} ${participateText}`
      : `${purchaseMembersCount} ${ofText} ${eventMembersCount} ${participateText}`;
  }
}
