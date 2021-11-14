import { Component, Input, OnInit } from '@angular/core';
import { Purchase, Event } from '../../../../../models/Event';
import { formatSum } from '../../../../../utils/Formatters';

@Component({
  selector: 'purchase-item',
  templateUrl: './purchase-item.component.html',
  styleUrls: ['./purchase-item.component.scss'],
})
export class PurchaseItemComponent implements OnInit {
  @Input() purchase!: Purchase;
  @Input() event!: Event;

  constructor() {}

  ngOnInit(): void {}

  onClick() {}

  purchaseSum() {
    return formatSum(this.purchase.sum);
  }

  purchaseSubtitle() {
    const purchaseMembersCount = this.purchase.members.length;
    const eventMembersCount = this.event.members.length;

    return purchaseMembersCount === 1
      ? `1 из ${eventMembersCount} участвует`
      : `${purchaseMembersCount} из ${eventMembersCount} участвуют`;
  }
}
