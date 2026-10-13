import { DecimalPipe, NgOptimizedImage } from '@angular/common';
import { afterNextRender, ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PROFILE } from '../../core/data/profile';
import type { GithubContributions } from '../../core/types/github-contribution';
import { getLocale, type Locale } from '../../core/types/locale';
import { LucideIcon } from '../../shared/components/lucide-icon/lucide-icon';
import { SiteFooter } from '../../shared/components/site-footer/site-footer';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-home-page',
  imports: [DecimalPipe, LucideIcon, NgOptimizedImage, RouterLink, SiteFooter],
  templateUrl: './home.html',
})
export class HomePage {
  private readonly route = inject(ActivatedRoute);
  private readonly githubContributionsState = signal<GithubContributions | null>(null);
  private readonly githubContributionLoadFailedState = signal(false);
  readonly locale: Locale = getLocale(this.route.parent?.snapshot.paramMap.get('locale'));
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
    afterNextRender(() => void this.loadGithubContributions());
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
