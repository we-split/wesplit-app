import { Routes } from '@angular/router';
import { LandingPageComponent } from './landing-page/landing-page.component';
import { AuthGuard, isNotAnonymous } from '@angular/fire/auth-guard';
import isPwa from '../../utils/PwaExtensions';
import { pipe } from 'rxjs';
import { map } from 'rxjs/operators';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const redirectToEventsIfIsPwa = (redirect: any[]) =>
  pipe(
    isNotAnonymous,
    map(loggedIn => !loggedIn || (isPwa() && redirect) || true)
  );

const redirectLoggedInToEvents = () => redirectToEventsIfIsPwa(['events']);

export const landingRoutes: Routes = [
  {
    path: '',
    component: LandingPageComponent,
    canActivate: [AuthGuard],
    data: {
      authGuardPipe: redirectLoggedInToEvents,
    },
  },
];
