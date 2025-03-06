import { Component, EventEmitter, Input, Output } from '@angular/core';
import { EventDto } from '../../../../models/Event';
import { DataService } from '../../../../shared/data.service';
import { MatDialog } from '@angular/material/dialog';
import { LocalizationService } from '../../../../shared/localization.service';
import { TranslocoDirective } from '@ngneat/transloco';
import { MatIconButton } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { EventHeaderComponent } from './event-header/event-header.component';
import { MatDivider } from '@angular/material/divider';

@Component({
  selector: 'event-sidenav',
  templateUrl: './event-sidenav.component.html',
  styleUrls: ['./event-sidenav.component.scss'],
  standalone: true,
  imports: [
    TranslocoDirective,
    MatIconButton,
    RouterLink,
    MatIcon,
    EventHeaderComponent,
    MatDivider,
  ],
})
export class EventSidenavComponent {
  @Input() event!: EventDto;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @Output() notifyParent = new EventEmitter<any>();

  constructor(
    private dataService: DataService,
    public dialog: MatDialog,
    private localizationService: LocalizationService
  ) {}

  get hasRePayedDebts(): boolean {
    return this.event?.rePayedDebts?.length > 0;
  }

  getMemberName(name: string) {
    const youText = this.localizationService.translate('common.you');

    let memberName: string = name;

    if (name === this.dataService.getCurrentUser(this.event.id)) {
      memberName += ` (${youText})`;
    }

    if (name === this.event.organizer) {
      memberName += ' ★';
    }

    return memberName;
  }

  openShareModal() {
    this.notifyParent.emit('openShareModal');
  }
}
