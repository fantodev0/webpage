import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { getLocale, type Locale } from '../../core/types/locale';
import { SiteFooter } from '../../shared/components/site-footer/site-footer';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-not-found-page',
  imports: [RouterLink, SiteFooter],
  templateUrl: './not-found.html',
})
export class NotFoundPage {
  private readonly route = inject(ActivatedRoute);
  readonly locale: Locale = getLocale(this.route.parent?.snapshot.paramMap.get('locale'));
}
