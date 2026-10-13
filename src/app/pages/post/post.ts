import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { BLOG_POSTS, type BlogPost } from '../../core/data/blog-data';
import { getLocale, type Locale } from '../../core/types/locale';
import { SiteFooter } from '../../shared/components/site-footer/site-footer';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-post-page',
  imports: [RouterLink, SiteFooter],
  templateUrl: './post.html',
})
export class PostPage {
  private readonly route = inject(ActivatedRoute);
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly document = inject(DOCUMENT);
  readonly locale: Locale = getLocale(this.route.parent?.snapshot.paramMap.get('locale'));
  readonly slug = this.route.snapshot.paramMap.get('slug') ?? '';
  readonly post: BlogPost | undefined = BLOG_POSTS.find(
    (item) => item.slug === this.slug && item.locale === this.locale,
  );
  readonly alternate: BlogPost | undefined = BLOG_POSTS.find(
    (item) => item.slug === this.slug && item.locale !== this.locale,
  );

  constructor() {
    if (!this.post) {
      this.title.setTitle(
        this.locale === 'de' ? 'Beitrag nicht gefunden — FantoDev' : 'Post not found — FantoDev',
      );
      return;
    }
    const pageTitle = `${this.post.title} — FantoDev`;
    this.title.setTitle(pageTitle);
    this.meta.updateTag({ name: 'description', content: this.post.description });
    this.meta.updateTag({ property: 'og:title', content: pageTitle });
    this.meta.updateTag({ property: 'og:description', content: this.post.description });
    this.meta.updateTag({ property: 'og:type', content: 'article' });
    this.meta.updateTag({ property: 'article:published_time', content: this.post.date });
    this.setLink('canonical', `https://fanto.dev/${this.locale}/writing/${this.post.slug}`);
    if (this.alternate)
      this.setLink(
        'alternate',
        `https://fanto.dev/${this.alternate.locale}/writing/${this.alternate.slug}`,
        this.alternate.locale,
      );
  }

  private setLink(rel: string, href: string, hreflang?: string) {
    const link =
      this.document.head.querySelector(`link[rel="${rel}"][hreflang="${hreflang ?? ''}"]`) ??
      this.document.createElement('link');
    link.setAttribute('rel', rel);
    link.setAttribute('href', href);
    if (hreflang) link.setAttribute('hreflang', hreflang);
    this.document.head.appendChild(link);
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
