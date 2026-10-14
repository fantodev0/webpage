import { ChangeDetectionStrategy, Component, effect, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';

import { ActivatedRoute, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { BLOG_POSTS, type BlogPost } from '../../core/data/blog-data';
import { LocaleService } from '../../core/services/locale.service';
import { SeoService } from '../../core/services/seo.service';
import { type Locale } from '../../core/types/locale';
import { SiteFooter } from '../../shared/components/site-footer/site-footer';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-post-page',
  imports: [RouterLink, SiteFooter],
  templateUrl: './post.html',
})
export class PostPage {
  private readonly route = inject(ActivatedRoute);
  private readonly localeService = inject(LocaleService);
  private readonly seo = inject(SeoService);
  private readonly slugState = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('slug') ?? '')),
    { initialValue: this.route.snapshot.paramMap.get('slug') ?? '' },
  );

  get locale(): Locale {
    return this.localeService.locale();
  }

  get slug(): string {
    return this.slugState();
  }

  get post(): BlogPost | undefined {
    return BLOG_POSTS.find((item) => item.slug === this.slug && item.locale === this.locale);
  }

  get alternate(): BlogPost | undefined {
    return BLOG_POSTS.find((item) => item.slug === this.slug && item.locale !== this.locale);
  }

  constructor() {
    effect(() => this.updatePageMetadata());
  }

  private updatePageMetadata(): void {
    const post = this.post;
    if (!post) {
      this.seo.update({
        title:
          this.locale === 'de' ? 'Beitrag nicht gefunden — FantoDev' : 'Post not found — FantoDev',
        description:
          this.locale === 'de'
            ? 'Der angeforderte Beitrag wurde nicht gefunden.'
            : 'The requested post could not be found.',
        locale: this.locale,
        path: `/${this.locale}/writing/${this.slug}`,
      });
      return;
    }

    this.seo.update({
      title: `${post.title} — FantoDev`,
      description: post.description,
      locale: this.locale,
      path: `/${this.locale}/writing/${post.slug}`,
      type: 'article',
      publishedTime: post.date,
    });
  }

  articleJson(article: BlogPost) {
    return JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: article.title,
      description: article.description,
      datePublished: article.date,
      inLanguage: article.locale,
      author: { '@type': 'Person', name: 'Lucien Siani', url: 'https://fanto.dev' },
      mainEntityOfPage: `https://fanto.dev/${article.locale}/writing/${article.slug}`,
    });
  }

  formatDate(date: string) {
    return new Intl.DateTimeFormat(this.locale === 'de' ? 'de-DE' : 'en-GB', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(new Date(`${date}T12:00:00`));
  }
}
