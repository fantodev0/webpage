import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { BLOG_POSTS } from '../../core/data/blog-data';
import { getLocale, type Locale } from '../../core/types/locale';
import { SiteFooter } from '../../shared/components/site-footer/site-footer';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-writing-page',
  imports: [RouterLink, SiteFooter],
  templateUrl: './writing.html',
})
export class WritingPage {
  private readonly route = inject(ActivatedRoute);
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  readonly locale: Locale = getLocale(this.route.parent?.snapshot.paramMap.get('locale'));
  readonly posts = BLOG_POSTS.filter((post) => post.locale === this.locale);

  constructor() {
    const pageTitle = this.locale === 'de' ? 'Writing — FantoDev' : 'Writing — FantoDev';
    const description =
      this.locale === 'de'
        ? 'Notizen zu Technik, Systemen und dem Bauen im Web.'
        : 'Notes on technology, systems, and building for the web.';
    this.title.setTitle(pageTitle);
    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({ property: 'og:title', content: pageTitle });
    this.meta.updateTag({ property: 'og:description', content: description });
  }

  formatDate(date: string) {
    return new Intl.DateTimeFormat(this.locale === 'de' ? 'de-DE' : 'en-GB', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(new Date(`${date}T12:00:00`));
  }
}
