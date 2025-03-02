import { Component } from '@angular/core';
import { TranslocoDirective } from '@ngneat/transloco';
import { MatButton } from '@angular/material/button';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found-page',
  templateUrl: './not-found-page.component.html',
  styleUrls: ['./not-found-page.component.scss'],
  standalone: true,
  imports: [TranslocoDirective, MatButton, RouterLink],
})
export class NotFoundPageComponent {}
