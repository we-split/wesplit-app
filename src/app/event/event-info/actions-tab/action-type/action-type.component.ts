import { Component, Input } from '@angular/core';
import { ActionTypes, EventAction } from '../../../../../models/Event';
import { TranslocoDirective } from '@ngneat/transloco';

@Component({
  selector: 'action-type',
  templateUrl: './action-type.component.html',
  standalone: true,
  imports: [TranslocoDirective],
})
export class ActionTypeComponent {
  @Input() public action!: EventAction;

  public get actionTypes(): typeof ActionTypes {
    return ActionTypes;
  }
}
