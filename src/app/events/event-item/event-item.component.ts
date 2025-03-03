import { Component, Input, OnInit } from '@angular/core';
import { DebtTypes, EventDto } from '../../../models/Event';
import { getEventBalance } from '../../../utils/EventBalanceCalculator';
import { formatDebtType, formatSum } from '../../../utils/Formatters';
import { utc } from 'moment';
import { DataService } from '../../../shared/data.service';
import { LocalizationService } from '../../../shared/localization.service';
import { TranslocoDirective } from '@ngneat/transloco';
import { RouterLink } from '@angular/router';
import { MatDivider } from '@angular/material/divider';

@Component({
  selector: 'event-item',
  templateUrl: './event-item.component.html',
  styleUrls: ['./event-item.component.scss'],
  standalone: true,
  imports: [TranslocoDirective, RouterLink, MatDivider],
})
export class EventItemComponent implements OnInit {
  @Input() public event!: EventDto;

  public date!: string;
  public sum!: string | null;
  public debtType!: string;
  public debtStatus!: string | null;

  constructor(
    private localizationService: LocalizationService,
    private dataService: DataService
  ) {}

  ngOnInit(): void {
    const { id, date } = this.event;

    const organizer = this.dataService.getCurrentUser(id);
    const lang = this.localizationService.getActiveLang();

    this.date = `${utc(date).locale(lang).format('DD MMMM')}, ${utc(date)
      .locale(lang)
      .format('dddd')}`;

    const eventBalance = getEventBalance(this.event);
    const currentBalance = eventBalance.find(x => x.name === organizer)?.sum || 0;
    const sum = Math.round(currentBalance);

    this.sum = sum == 0 ? null : `${formatSum(lang, Math.abs(sum))}`;

    const hasOutgoingDebts = this.localizationService.translate('common.hasOutgoingDebts');
    const hasIncomingDebts = this.localizationService.translate('common.hasIncomingDebts');

    this.debtStatus = sum !== 0 ? (sum > 0 ? hasOutgoingDebts : hasIncomingDebts) : null;

    this.debtType = DebtTypes[formatDebtType(currentBalance)].toLowerCase();
  }
}
