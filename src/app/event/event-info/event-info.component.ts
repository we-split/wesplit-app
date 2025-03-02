import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { EventDto } from '../../../models/Event';
import { DataService } from '../../../shared/data.service';
import { MatDialog } from '@angular/material/dialog';
import { ShareEventComponent } from './share-event/share-event.component';
import { Title } from '@angular/platform-browser';
import { environment } from '../../../environments/environment';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, take } from 'rxjs/operators';
import { AuthenticationService } from '../../../shared/authentication.service';
import { TranslocoDirective } from '@ngneat/transloco';
import { SidenavLayoutComponent } from '../../base-elements/layouts/sidenav-layout/sidenav-layout.component';
import { EventSidenavComponent } from './event-sidenav/event-sidenav.component';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatTab, MatTabGroup } from '@angular/material/tabs';
import { PurchasesTabComponent } from './purchases-tab/purchases-tab.component';
import { DebtsTabComponent } from './debts-tab/debts-tab.component';
import { ActionsTabComponent } from './actions-tab/actions-tab.component';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'event-info',
  templateUrl: './event-info.component.html',
  styleUrls: ['./event-info.component.scss'],
  standalone: true,
  imports: [
    TranslocoDirective,
    SidenavLayoutComponent,
    EventSidenavComponent,
    MatIconButton,
    RouterLink,
    MatIcon,
    MatTabGroup,
    MatTab,
    PurchasesTabComponent,
    DebtsTabComponent,
    ActionsTabComponent,
    AsyncPipe,
  ],
})
export class EventInfoComponent implements OnInit {
  loading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  eventId!: string;
  opened = false;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  event$!: Observable<EventDto> | Observable<any>;

  constructor(
    private router: Router,
    private activateRoute: ActivatedRoute,
    private dataService: DataService,
    private dialog: MatDialog,
    private title: Title,
    public authService: AuthenticationService
  ) {}

  catchHttpError = () =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    catchError((error: any) => {
      const msg = `${error.status} ${error.statusText} -  ${error.url}`;

      return of(new Error(msg));
    });

  async ngOnInit() {
    this.eventId = this.activateRoute.snapshot.params['id'];
    this.event$ = this.dataService.getEventById(this.eventId).pipe(
      catchError(() => {
        this.router.navigate(['/', 'events']);
        return of();
      }),
      take(1)
    );

    // TODO: this hack is disgusting
    if (this.activateRoute.snapshot.queryParams['refresh']) {
      const url = new URL(window.location.href.split('?')[0]);
      window.location = url as unknown as Location;
    }

    if (history.state.isCreated) {
      this.openShareModal();
    }

    if (!this.dataService.getCurrentUser(this.eventId)) {
      await this.router.navigate(['login'], { relativeTo: this.activateRoute });
    }

    this.loading$.next(true);

    this.event$.subscribe(
      async (event: EventDto | null) => {
        if (event) {
          this.title.setTitle(`${event.name} - ${environment.name}`);
        }
      },
      () => console.error,
      () => this.loading$.next(false)
    );
  }

  getNotification(event: string) {
    if (event === 'openShareModal') {
      this.openShareModal();
    }
  }

  openShareModal() {
    this.event$.subscribe((event: EventDto) => {
      const { name: eventName, id: eventId, ownerUserId: userId } = event;

      const eventShareLink = `${window.location.origin}/events/${eventId}/login?uid=${userId}`;

      this.dialog.open(ShareEventComponent, {
        width: '350px',
        data: {
          title: eventName,
          url: eventShareLink,
        },
      });
    });
  }
}
