import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter, map, mergeMap, takeUntil } from 'rxjs/operators';
import { environment } from '../environments/environment';
import { Title } from '@angular/platform-browser';
import { ThemeService } from '../shared/theme.service';
import { LocalizationService } from '../shared/localization.service';
import { combineLatest, ReplaySubject } from 'rxjs';
import { CurrencyService } from '../shared/currency.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: true,
  imports: [RouterOutlet],
})
export class AppComponent implements OnInit, OnDestroy {
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private titleService: Title,
    private localizationService: LocalizationService,
    private themeService: ThemeService,
    private currencyService: CurrencyService
  ) {}

  destroyed$: ReplaySubject<boolean> = new ReplaySubject<boolean>(1);

  async ngOnInit() {
    this.themeService.initTheme();
    this.localizationService.initLocalization();
    this.currencyService.initCurrency();

    const routes$ = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map(() => this.rootRoute(this.route)),
      filter((route: ActivatedRoute) => route.outlet === 'primary'),
      map(route => route)
    );

    const data$ = routes$.pipe(mergeMap((route: ActivatedRoute) => route.data));
    const url$ = routes$.pipe(mergeMap((route: ActivatedRoute) => route.url));

    combineLatest([routes$, data$, url$])
      .pipe(takeUntil(this.destroyed$))
      .subscribe(([, data]) => {
        this.localizationService.load().subscribe(() => {
          if (data['scope']) {
            const title = this.localizationService.translate(`${data['scope']}.title`);

            this.titleService.setTitle(`${title} - ${environment.name}`);
          }
        });
      });
  }

  private rootRoute(route: ActivatedRoute): ActivatedRoute {
    while (route.firstChild) {
      route = route.firstChild;
    }

    return route;
  }

  ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }
}
