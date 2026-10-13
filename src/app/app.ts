import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { getLocale, type Locale, type Theme } from './core/types/locale';
import { LucideIcon } from './shared/components/lucide-icon/lucide-icon';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LucideIcon, RouterLink, RouterOutlet],
  selector: 'app-root',
  templateUrl: './app.html',
})
export class App {
  private readonly router = inject(Router);
  private readonly document = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);
  readonly locale = signal<Locale>('en');
  readonly theme = signal<Theme>('light');

  constructor() {
    const updateLocale = (url: string) => {
      const locale = getLocale(url.split('/')[1]);
      this.locale.set(locale);
      this.document.documentElement.lang = locale;
    };
    updateLocale(this.router.url);
    const subscription = this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event) => updateLocale(event.urlAfterRedirects));
    this.destroyRef.onDestroy(() => subscription.unsubscribe());
  }

  setTheme(theme: Theme) {
    this.theme.set(theme);
    this.document.documentElement.dataset['theme'] = theme;
    if (typeof localStorage !== 'undefined') localStorage.setItem('fanto-theme', theme);
  }

  languageUrl(locale: Locale): string {
    return `/${locale}${this.router.url.replace(/^\/(en|de)/, '')}`;
  }
}
