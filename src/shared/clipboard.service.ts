import { ElementRef, Injectable } from '@angular/core';
import { LocalizationService } from './localization.service';
import { NotificationService } from './notification.service';

@Injectable({
  providedIn: 'root',
})
export class ClipboardService {
  constructor(
    private localizationService: LocalizationService,
    private notificationService: NotificationService
  ) {}

  public copyFromText(
    text: string,
    successLocalizationKey = 'clipboard.success',
    failedLocalizationText = 'clipboard.failed'
  ) {
    window.navigator.clipboard
      .writeText(text)
      .then(() => {
        this.notificationService.open(this.localizationService.translate(successLocalizationKey));
      })
      .catch(() => {
        this.notificationService.open(this.localizationService.translate(failedLocalizationText));
      });
  }

  public copyFromElement(
    elRef: ElementRef,
    selector: string,
    successLocalizationKey = 'clipboard.success',
    failedLocalizationText = 'clipboard.failed'
  ) {
    const htmlContent = elRef.nativeElement.querySelector(selector);

    const range = document.createRange();
    const selection = window.getSelection();
    selection?.removeAllRanges();

    range.selectNode(htmlContent);
    selection?.addRange(range);

    if (!document.execCommand('copy')) {
      this.notificationService.open(this.localizationService.translate(failedLocalizationText));
    } else {
      this.notificationService.open(this.localizationService.translate(successLocalizationKey));
    }

    selection?.removeAllRanges();
  }
}
