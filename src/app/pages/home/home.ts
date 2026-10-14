import { DecimalPipe, NgOptimizedImage } from '@angular/common';
import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { PROFILE } from '../../core/data/profile';
import { LocaleService } from '../../core/services/locale.service';
import { SeoService } from '../../core/services/seo.service';
import type { GithubContributions } from '../../core/types/github-contribution';
import { type Locale } from '../../core/types/locale';
import { LucideIcon } from '../../shared/components/lucide-icon/lucide-icon';
import { SiteFooter } from '../../shared/components/site-footer/site-footer';
import { MonogramF } from './monogram-f/monogram-f';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-home-page',
  imports: [DecimalPipe, LucideIcon, MonogramF, NgOptimizedImage, RouterLink, SiteFooter],
  templateUrl: './home.html',
})
export class HomePage {
  private readonly localeService = inject(LocaleService);
  private readonly seo = inject(SeoService);
  private readonly githubContributionsState = signal<GithubContributions | null>(null);
  private readonly githubContributionLoadFailedState = signal(false);

  get locale(): Locale {
    return this.localeService.locale();
  }
  readonly profile = PROFILE;
  readonly githubContributions = this.githubContributionsState.asReadonly();
  readonly githubContributionLoadFailed = this.githubContributionLoadFailedState.asReadonly();
  readonly contributionLevelColors = [
    'var(--soft-line)',
    'color-mix(in srgb, var(--ink) 12%, var(--surface))',
    'color-mix(in srgb, var(--ink) 22%, var(--surface))',
    'color-mix(in srgb, var(--ink) 34%, var(--surface))',
    'color-mix(in srgb, var(--ink) 48%, var(--surface))',
  ] as const;

  constructor() {
    effect(() => this.updatePageMetadata(this.locale));
    afterNextRender(() => void this.loadGithubContributions());
  }

  private updatePageMetadata(locale: Locale): void {
    this.seo.update({
      title: 'FantoDev — Lucien Siani',
      description:
        locale === 'de'
          ? 'Lucien Siani — ein Platzhalter-Portfolio für sorgfältig entwickelte digitale Arbeiten.'
          : 'Lucien Siani — a placeholder portfolio for thoughtful digital work.',
      locale,
      path: `/${locale}`,
    });
  }

  private async loadGithubContributions(): Promise<void> {
    try {
      const response = await fetch('/api/github-contributions', { cache: 'no-store' });

      if (!response.ok) {
        this.githubContributionLoadFailedState.set(true);
        return;
      }

      this.githubContributionsState.set((await response.json()) as GithubContributions);
    } catch {
      this.githubContributionLoadFailedState.set(true);
    }
  }
}
