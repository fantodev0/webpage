import { RenderMode, ServerRoute } from '@angular/ssr';
import { BLOG_POSTS } from './core/data/blog-data';

export const serverRoutes: ServerRoute[] = [
  {
    path: ':locale',
    renderMode: RenderMode.Prerender,
    async getPrerenderParams() {
      return [{ locale: 'en' }, { locale: 'de' }];
    },
  },
  {
    path: ':locale/writing',
    renderMode: RenderMode.Prerender,
    async getPrerenderParams() {
      return [{ locale: 'en' }, { locale: 'de' }];
    },
  },
  {
    path: ':locale/writing/:slug',
    renderMode: RenderMode.Prerender,
    async getPrerenderParams() {
      return BLOG_POSTS.map((post) => ({ locale: post.locale, slug: post.slug }));
    },
  },
  { path: '**', renderMode: RenderMode.Server },
];
