import { Injectable } from '@angular/core';
import { TranslocoService } from '@ngneat/transloco';
import { take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class LocalizationService {
  constructor(private translocoService: TranslocoService) {}

  initLocalization() {
    const lang = localStorage.getItem('lang') ?? this.getDefaultLang();
    this.setActiveLang(lang);
  }

  load() {
    const lang = this.getActiveLang();
    return this.translocoService.load(lang);
  }

  translate(key: string) {
    const lang = this.getActiveLang();
    return this.translocoService.translate(key, {}, lang);
  }

  getActiveLang() {
    return this.translocoService.getActiveLang();
  }

  setActiveLang(lang: string) {
    this.translocoService.setActiveLang(lang);
    localStorage.setItem('lang', lang);
  }

  getDefaultLang() {
    return this.translocoService.getDefaultLang();
  }

  getTranslationSection(key: string): Record<string, string> {
    let translation = {};

    this.translocoService
      .selectTranslateObject(key, {}, this.getActiveLang())
      .pipe(take(1))
      .subscribe(data => {
        translation = data;
      });

    return translation;
  }
}
