import { ChangeDetectionStrategy, Component, effect, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BLOG_POSTS } from '../../core/data/blog-data';
import { LocaleService } from '../../core/services/locale.service';
import { SeoService } from '../../core/services/seo.service';
import { type Locale } from '../../core/types/locale';
import { SiteFooter } from '../../shared/components/site-footer/site-footer';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-writing-page',
  imports: [RouterLink, SiteFooter],
  templateUrl: './writing.html',
})
export class WritingPage {
  private readonly localeService = inject(LocaleService);
  private readonly seo = inject(SeoService);

  get locale(): Locale {
    return this.localeService.locale();
  }

  get posts() {
    return BLOG_POSTS.filter((post) => post.locale === this.locale);
  }

  constructor() {
    effect(() => this.updatePageMetadata(this.locale));
  }

  private updatePageMetadata(locale: Locale): void {
    const pageTitle = 'Writing — FantoDev';
    const description =
      locale === 'de'
        ? 'Notizen zu Technik, Systemen und dem Bauen im Web.'
        : 'Notes on technology, systems, and building for the web.';
    this.seo.update({
      title: pageTitle,
      description,
      locale,
      path: `/${locale}/writing`,
    });
  }

  formatDate(date: string) {
    return new Intl.DateTimeFormat(this.locale === 'de' ? 'de-DE' : 'en-GB', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(new Date(`${date}T12:00:00`));
  }
}
