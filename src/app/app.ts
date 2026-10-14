import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';
import { PRIMARY_OUTLET, Router, RouterLink, RouterOutlet, UrlTree } from '@angular/router';
import { LocaleService } from './core/services/locale.service';
import { type Locale, type Theme } from './core/types/locale';
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
  private readonly localeService = inject(LocaleService);
  readonly locale = this.localeService.locale;
  readonly theme = signal<Theme>('light');

  constructor() {
    effect(() => {
      this.document.documentElement.lang = this.locale();
    });
  }

  setTheme(theme: Theme) {
    this.theme.set(theme);
    this.document.documentElement.dataset['theme'] = theme;
    if (typeof localStorage !== 'undefined') localStorage.setItem('fanto-theme', theme);
  }

  languageUrl(locale: Locale): UrlTree {
    const currentUrl = this.router.parseUrl(this.router.url);
    const primarySegments = currentUrl.root.children[PRIMARY_OUTLET]?.segments ?? [];
    const remainingSegments =
      primarySegments[0]?.path === 'en' || primarySegments[0]?.path === 'de'
        ? primarySegments.slice(1)
        : primarySegments;

    return this.router.createUrlTree(
      ['/', locale, ...remainingSegments.map((segment) => segment.path)],
      {
        fragment: currentUrl.fragment ?? undefined,
        queryParams: currentUrl.queryParams,
      },
    );
  }
}
