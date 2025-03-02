import { Component, Input } from '@angular/core';
import { ActionTypes, EventAction } from '../../../../../models/Event';
import { utc } from 'moment';
import { LocalizationService } from '../../../../../shared/localization.service';
import { CurrencyService } from '../../../../../shared/currency.service';
import { TranslocoDirective } from '@ngneat/transloco';
import { MatIcon } from '@angular/material/icon';
import { ActionTypeComponent } from '../action-type/action-type.component';
import { MatDivider } from '@angular/material/divider';

export const actionIcons: Record<ActionTypes, string> = {
  [ActionTypes.CreateEvent]: 'calendar_today',
  [ActionTypes.ChangeEventName]: 'create',
  [ActionTypes.ChangeEventDate]: 'create',
  [ActionTypes.AddMemberToEvent]: 'person',
  [ActionTypes.AddMembersToEvent]: 'person',
  [ActionTypes.RemoveMemberFromEvent]: 'delete_sweep',
  [ActionTypes.AddPurchase]: 'add_shopping_cart',
  [ActionTypes.DeletePurchase]: 'create',
  [ActionTypes.AddMemberToPurchase]: 'create',
  [ActionTypes.AddMembersToPurchase]: 'create',
  [ActionTypes.RemoveMemberFromPurchase]: 'create',
  [ActionTypes.GiveBackPartially]: 'check_circle',
  [ActionTypes.GiveBack]: 'check',
};

@Component({
  selector: 'action-item',
  templateUrl: './action-item.component.html',
  styleUrls: ['./action-item.component.scss'],
  standalone: true,
  imports: [TranslocoDirective, MatIcon, ActionTypeComponent, MatDivider],
})
export class ActionItemComponent {
  @Input() public action!: EventAction;

  constructor(
    private localizationService: LocalizationService,
    public currencyService: CurrencyService
  ) {}

  get actionIcon(): string {
    return actionIcons[this.action.type];
  }

  get actionDate(): string {
    const lang = this.localizationService.getActiveLang();

    return this.action?.date ? utc(this.action?.date).locale(lang).fromNow() : '';
  }
}
