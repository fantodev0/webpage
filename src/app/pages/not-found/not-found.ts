import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LocaleService } from '../../core/services/locale.service';
import { type Locale } from '../../core/types/locale';
import { SiteFooter } from '../../shared/components/site-footer/site-footer';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-not-found-page',
  imports: [RouterLink, SiteFooter],
  templateUrl: './not-found.html',
})
export class NotFoundPage {
  private readonly localeService = inject(LocaleService);

  get locale(): Locale {
    return this.localeService.locale();
  }
}
