export interface GithubContributionDay {
  date: string;
  level: 0 | 1 | 2 | 3 | 4;
  count: number;
}

export interface GithubContributionMonth {
  label: string;
  column: number;
}

export interface GithubContributions {
  username: string;
  total: number;
  days: readonly GithubContributionDay[];
  months: readonly GithubContributionMonth[];
}
