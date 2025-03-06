import { ApplicationRef, Injectable, Renderer2, RendererFactory2 } from '@angular/core';

const DARK_MODE = 'dark-mode';
const LIGHT_MODE = 'light-mode';
const AUTO_MODE = 'auto-mode';
const USER_THEME = 'user-theme';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private renderer: Renderer2;

  constructor(
    private rendererFactory: RendererFactory2,
    private ref: ApplicationRef
  ) {
    this.renderer = rendererFactory.createRenderer(null, null);

    if (!localStorage.getItem(USER_THEME)) {
      localStorage.setItem(USER_THEME, AUTO_MODE);
    }

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
      const isDarkModeOn = e.matches;

      const isAutoMode = localStorage.getItem('user-theme') === AUTO_MODE;
      if (isAutoMode) {
        const theme = isDarkModeOn ? DARK_MODE : LIGHT_MODE;
        this.update(theme);
      }

      this.ref.tick();
    });
  }

  initTheme() {
    const theme = this.getColorTheme();
    this.update(theme);
  }

  update(theme: string) {
    const isAutoMode = theme === AUTO_MODE;
    if (isAutoMode) {
      const isDarkModeOn =
        window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

      theme = isDarkModeOn ? DARK_MODE : LIGHT_MODE;
    }

    this.renderer.removeAttribute(document.body, 'class');
    this.renderer.addClass(document.body, 'mat-typography');
    this.renderer.addClass(document.body, theme);
  }

  setColorTheme(theme: string) {
    localStorage.setItem(USER_THEME, theme);
  }

  getColorTheme() {
    return localStorage.getItem(USER_THEME) ?? AUTO_MODE;
  }
}
