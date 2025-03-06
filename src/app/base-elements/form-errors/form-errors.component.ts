import { Component, Input } from '@angular/core';
import { LocalizationService } from '../../../shared/localization.service';
import { UntypedFormGroup } from '@angular/forms';

@Component({
  selector: 'form-errors',
  templateUrl: './form-errors.component.html',
  styleUrls: ['./form-errors.component.scss'],
  standalone: true,
})
export class FormErrorsComponent {
  @Input() localization!: string;
  @Input() form!: UntypedFormGroup;
  @Input() errors!: string[];
  @Input() force = false;

  constructor(private localizationService: LocalizationService) {}

  errorText(key: string): string {
    return this.localizationService.translate(`${this.localization}.${key}`) ?? '';
  }

  formHasError(key: string): boolean {
    return this.force || Boolean(this.form.errors && this.form.errors[key]);
  }
}
