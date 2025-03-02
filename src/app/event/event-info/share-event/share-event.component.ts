import { Component, Inject } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import { LocalizationService } from '../../../../shared/localization.service';
import { ClipboardService } from '../../../../shared/clipboard.service';
import { TranslocoDirective } from '@ngneat/transloco';
import { MatButton } from '@angular/material/button';
import { CdkCopyToClipboard } from '@angular/cdk/clipboard';

@Component({
  selector: 'share-event',
  templateUrl: './share-event.component.html',
  styleUrls: ['./share-event.component.scss'],
  standalone: true,
  imports: [
    TranslocoDirective,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatButton,
    CdkCopyToClipboard,
  ],
})
export class ShareEventComponent {
  constructor(
    private dialogRef: MatDialogRef<ShareEventComponent>,
    private clipboardService: ClipboardService,
    private localizationService: LocalizationService,
    @Inject(MAT_DIALOG_DATA)
    public data: { title: string; url: string }
  ) {}

  get eventLink(): string {
    return this.data.url;
  }

  get copyButtonText() {
    if ('share' in window.navigator) {
      return this.localizationService.translate('event.share.title');
    }

    return this.localizationService.translate('event.share.copy');
  }

  onLaterClick() {
    this.dialogRef.close();
  }

  openNativeShare() {
    const { title, url } = this.data;

    window.navigator
      .share({
        url,
        title,
        text: `${title} | ${this.localizationService.translate('event.share.text')}`,
      })
      .catch(console.error);
  }

  onCopyClick() {
    this.closeShareModal();

    if ('share' in window.navigator) {
      this.openNativeShare();
    } else {
      this.clipboardService.copyFromText(this.data.url, 'event.share.copied');
    }
  }

  private closeShareModal(): void {
    this.dialogRef.close();
  }
}
