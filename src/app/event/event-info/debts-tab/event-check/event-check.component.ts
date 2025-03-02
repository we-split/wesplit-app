import { Component, ElementRef, Input } from '@angular/core';
import { EventDto, MemberDebt } from '../../../../../models/Event';
import { ClipboardService } from '../../../../../shared/clipboard.service';
import { CurrencyService } from '../../../../../shared/currency.service';
import { TranslocoDirective } from '@ngneat/transloco';
import {
  MatAccordion,
  MatExpansionPanel,
  MatExpansionPanelDescription,
  MatExpansionPanelHeader,
  MatExpansionPanelTitle,
} from '@angular/material/expansion';
import { MatIcon } from '@angular/material/icon';
import { MatButton } from '@angular/material/button';

@Component({
  selector: 'event-check',
  templateUrl: './event-check.component.html',
  styleUrls: ['./event-check.component.scss'],
  standalone: true,
  imports: [
    TranslocoDirective,
    MatAccordion,
    MatExpansionPanel,
    MatExpansionPanelHeader,
    MatExpansionPanelTitle,
    MatIcon,
    MatExpansionPanelDescription,
    MatButton,
  ],
})
export class EventCheckComponent {
  @Input() public event!: EventDto;
  @Input() public debts!: MemberDebt[];

  checkOpenState = false;

  constructor(
    private elRef: ElementRef,
    private currencyService: CurrencyService,
    private clipboardService: ClipboardService
  ) {}

  get check(): string[] {
    const currencyText = this.currencyService.getCurrencyAcronym();

    return this.debts?.map(
      debt => `${debt.from} → ${debt.to}   ${Math.abs(debt?.sum || 0)} ${currencyText}`
    );
  }

  copyCheck() {
    this.clipboardService.copyFromElement(
      this.elRef,
      '.balance-check-content__debts',
      'event.balance.clipboard.success',
      'event.balance.clipboard.failed'
    );
  }
}
