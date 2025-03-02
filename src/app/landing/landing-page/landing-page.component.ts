import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { LocalizationService } from '../../../shared/localization.service';
import { TranslocoDirective } from '@ngneat/transloco';
import { MatButton } from '@angular/material/button';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-landing-page',
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.scss'],
  standalone: true,
  imports: [TranslocoDirective, MatButton, RouterLink],
})
export class LandingPageComponent implements OnInit {
  isNormalStatus = true;

  constructor(
    private httpClient: HttpClient,
    private localizationService: LocalizationService
  ) {}

  ngOnInit(): void {
    this.getSystemStatus();
  }

  get systemStatus() {
    return this.isNormalStatus
      ? this.localizationService.translate('landing.status.noProblems')
      : this.localizationService.translate('landing.status.hasProblems');
  }

  getSystemStatus() {
    const { url, checkId, accountId, token } = environment.checklyhq;

    this.httpClient
      .get(`${url}/${checkId}`, {
        headers: {
          Authorization: 'Bearer ' + token,
          'X-Checkly-Account': accountId,
        },
      })
      .subscribe((x: { hasErrors?: boolean; hasFailures?: boolean }) => {
        this.isNormalStatus = !(x.hasErrors && x.hasFailures);
      });
  }
}
