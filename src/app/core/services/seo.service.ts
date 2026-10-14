import { DOCUMENT } from '@angular/common';
import { Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import type { Locale } from '../types/locale';

const SITE_URL = 'https://fanto.dev';
const SOCIAL_IMAGE = `${SITE_URL}/assets/Portrait.jpg`;
const SOCIAL_IMAGE_ALT = 'Portrait of Lucien Siani';
const SOCIAL_IMAGE_WIDTH = '541';
const SOCIAL_IMAGE_HEIGHT = '495';

type PageType = 'website' | 'article';

interface SeoPage {
  title: string;
  description: string;
  locale: Locale;
  path: string;
  type?: PageType;
  publishedTime?: string;
}

@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly document = inject(DOCUMENT);
  private readonly meta = inject(Meta);
  private readonly title = inject(Title);

  update(page: SeoPage): void {
    const pageUrl = `${SITE_URL}${page.path}`;
    const alternateLocale: Locale = page.locale === 'en' ? 'de' : 'en';
    const alternatePath = page.path.replace(/^\/(en|de)(?=\/|$)/, `/${alternateLocale}`);
    const pageType = page.type ?? 'website';

    this.title.setTitle(page.title);
    this.updateMeta('name', 'description', page.description);
    this.updateMeta('property', 'og:type', pageType);
    this.updateMeta('property', 'og:site_name', 'FantoDev');
    this.updateMeta('property', 'og:title', page.title);
    this.updateMeta('property', 'og:description', page.description);
    this.updateMeta('property', 'og:url', pageUrl);
    this.updateMeta('property', 'og:locale', page.locale === 'de' ? 'de_DE' : 'en_US');
    this.updateMeta('property', 'og:locale:alternate', page.locale === 'de' ? 'en_US' : 'de_DE');
    this.updateMeta('property', 'og:image', SOCIAL_IMAGE);
    this.updateMeta('property', 'og:image:alt', SOCIAL_IMAGE_ALT);
    this.updateMeta('property', 'og:image:width', SOCIAL_IMAGE_WIDTH);
    this.updateMeta('property', 'og:image:height', SOCIAL_IMAGE_HEIGHT);
    this.updateMeta('property', 'og:image:type', 'image/jpeg');
    this.updateMeta('name', 'twitter:card', 'summary_large_image');
    this.updateMeta('name', 'twitter:title', page.title);
    this.updateMeta('name', 'twitter:description', page.description);
    this.updateMeta('name', 'twitter:image', SOCIAL_IMAGE);
    this.updateMeta('name', 'twitter:image:alt', SOCIAL_IMAGE_ALT);

    if (page.publishedTime) {
      this.updateMeta('property', 'article:published_time', page.publishedTime);
    } else {
      this.meta.removeTag('property="article:published_time"');
    }

    this.setLink('canonical', pageUrl);
    this.setLink('alternate', `${SITE_URL}${page.path}`, page.locale);
    this.setLink('alternate', `${SITE_URL}${alternatePath}`, alternateLocale);
    this.setLink('alternate', `${SITE_URL}${page.path}`, 'x-default');
  }

  private updateMeta(attribute: 'name' | 'property', key: string, content: string): void {
    this.meta.updateTag({ [attribute]: key, content }, `${attribute}="${key}"`);
  }

  private setLink(rel: string, href: string, hreflang?: string): void {
    const selector = hreflang
      ? `link[rel="${rel}"][hreflang="${hreflang}"]`
      : `link[rel="${rel}"]:not([hreflang])`;
    const link =
      this.document.head.querySelector<HTMLLinkElement>(selector) ??
      this.document.createElement('link');

    link.setAttribute('rel', rel);
    link.setAttribute('href', href);
    if (hreflang) link.setAttribute('hreflang', hreflang);
    this.document.head.appendChild(link);
  }
}
