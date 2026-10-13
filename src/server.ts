import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { join } from 'node:path';
import { PROFILE } from './app/core/data/profile';
import type {
  GithubContributionDay,
  GithubContributionMonth,
  GithubContributions,
} from './app/core/types/github-contribution';

const browserDistFolder = join(import.meta.dirname, '../browser');

const app = express();
const angularApp = new AngularNodeAppEngine();
const contributionCacheDurationMs = 60 * 60 * 1000;
const contributionDayPattern =
  /<td\b(?=[^>]*\bdata-date="([^"]+)")(?=[^>]*\bdata-level="([0-4])")[^>]*><\/td>\s*<tool-tip\b[^>]*>([^<]*)<\/tool-tip>/g;
const monthFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  timeZone: 'UTC',
});
let contributionCache: { data: GithubContributions; expiresAt: number } | undefined;

function parseGithubContributions(html: string): GithubContributions {
  const days: GithubContributionDay[] = [];

  for (const match of html.matchAll(contributionDayPattern)) {
    const [, date, level, description] = match;

    if (!date || !level || !description) {
      continue;
    }

    const count = Number.parseInt(description.trim(), 10) || 0;
    days.push({
      date,
      level: Number(level) as GithubContributionDay['level'],
      count,
    });
  }

  if (days.length === 0) {
    throw new Error('GitHub returned no contribution data.');
  }

  days.sort((first, second) => first.date.localeCompare(second.date));

  const seenMonths = new Set<string>();
  const months: GithubContributionMonth[] = [];

  for (const [index, day] of days.entries()) {
    const monthKey = day.date.slice(0, 7);

    if (!seenMonths.has(monthKey)) {
      seenMonths.add(monthKey);
      months.push({
        label: monthFormatter.format(new Date(`${day.date}T00:00:00Z`)),
        column: Math.floor(index / 7),
      });
    }
  }

  return {
    username: PROFILE.githubUsername,
    total: days.reduce((sum, day) => sum + day.count, 0),
    days,
    months,
  };
}

async function getGithubContributions(): Promise<GithubContributions> {
  if (contributionCache && contributionCache.expiresAt > Date.now()) {
    return contributionCache.data;
  }

  try {
    const response = await fetch(
      `https://github.com/users/${PROFILE.githubUsername}/contributions`,
      {
        headers: {
          Accept: 'text/html',
          'User-Agent': 'fanto.dev contribution calendar',
        },
        signal: AbortSignal.timeout(5_000),
      },
    );

    if (!response.ok) {
      throw new Error(`GitHub contribution request failed with ${response.status}.`);
    }

    const data = parseGithubContributions(await response.text());
    contributionCache = { data, expiresAt: Date.now() + contributionCacheDurationMs };
    return data;
  } catch (error) {
    if (contributionCache) {
      return contributionCache.data;
    }

    throw error;
  }
}

app.get('/api/github-contributions', async (_req, res) => {
  try {
    const contributions = await getGithubContributions();
    res.set('Cache-Control', 'public, max-age=3600, stale-while-revalidate=86400');
    res.json(contributions);
  } catch {
    res.status(502).json({ message: 'GitHub contributions are temporarily unavailable.' });
  }
});

/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) => (response ? writeResponseToNodeResponse(response, res) : next()))
    .catch(next);
});

/**
 * Start the server if this module is the main entry point, or it is ran via PM2.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, (error) => {
    if (error) {
      throw error;
    }

    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);
