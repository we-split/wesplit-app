import { Component, OnInit } from '@angular/core';
import { ThemeService } from '../../../shared/theme.service';
import { LocalizationService } from '../../../shared/localization.service';
import { Location } from '@angular/common';
import {
  ReactiveFormsModule,
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { CurrencyService } from '../../../shared/currency.service';
import { TranslocoDirective } from '@ngneat/transloco';
import { LayoutComponent } from '../../base-elements/layouts/layout/layout.component';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';

@Component({
  selector: 'app-settings-form',
  templateUrl: './settings-form.component.html',
  styleUrls: ['./settings-form.component.scss'],
  standalone: true,
  imports: [
    TranslocoDirective,
    LayoutComponent,
    MatIconButton,
    MatIcon,
    ReactiveFormsModule,
    MatFormField,
    MatLabel,
    MatInput,
  ],
})
export class SettingsFormComponent implements OnInit {
  settingsForm!: UntypedFormGroup;

  constructor(
    private formBuilder: UntypedFormBuilder,
    private localizationService: LocalizationService,
    private themeService: ThemeService,
    private location: Location,
    public currencyService: CurrencyService
  ) {
    this.themeService.initTheme();
  }

  ngOnInit(): void {
    const selectedLanguage = this.localizationService.getActiveLang();
    const selectedTheme = this.themeService.getColorTheme();
    const selectedCurrency = this.currencyService.getCurrency();

    this.settingsForm = this.formBuilder.group({
      language: [selectedLanguage, Validators.required],
      theme: [selectedTheme, Validators.required],
      currency: [selectedCurrency, Validators.required],
    });

    this.settingsForm.valueChanges.subscribe(() => this.saveSettings());
  }

  onBack() {
    this.location.back();
  }

  saveSettings() {
    const { language, theme, currency } = this.settingsForm.value;

    this.currencyService.update(currency);

    this.localizationService.setActiveLang(language);

    this.themeService.update(theme);
    this.themeService.setColorTheme(theme);
  }
}
