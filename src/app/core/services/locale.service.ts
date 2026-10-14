import { Injectable, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { distinctUntilChanged, filter, map, startWith } from 'rxjs';
import { getLocale, type Locale } from '../types/locale';

@Injectable({ providedIn: 'root' })
export class LocaleService {
  private readonly router = inject(Router);

  readonly locale = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map((event) => event.urlAfterRedirects),
      startWith(this.router.url),
      map((url) => this.localeFromUrl(url)),
      distinctUntilChanged(),
    ),
    { initialValue: this.localeFromUrl(this.router.url) },
  );

  private localeFromUrl(url: string): Locale {
    return getLocale(url.split(/[?#]/, 1)[0].split('/')[1]);
  }
}
