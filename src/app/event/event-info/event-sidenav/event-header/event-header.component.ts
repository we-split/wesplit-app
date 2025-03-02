import { Component, Input } from '@angular/core';
import { utc } from 'moment';
import { Event } from '../../../../../models/Event';
import { LocalizationService } from '../../../../../shared/localization.service';

@Component({
  selector: 'event-header',
  templateUrl: './event-header.component.html',
  styleUrls: ['./event-header.component.scss'],
  standalone: true,
})
export class EventHeaderComponent {
  @Input() event!: Event;

  constructor(private localizationService: LocalizationService) {}

  get eventSubtitle(): string {
    const lang = this.localizationService.getActiveLang();

    const membersText = this.localizationService.translate('common.members');
    const memberStatus = `${this.event?.members?.length ?? 0} ${membersText}`;
    const formattedDate = utc(this.event.date).locale(lang).format('DD MMMM');

    return `${memberStatus} • ${formattedDate}`;
  }
}
