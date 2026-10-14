# AGENTS.md

## Project overview

This repository is the standalone Angular 22 portfolio for **fanto.dev**. It uses a restrained grid-and-panel visual system, Lucien Siani / FantoDev placeholder copy, bilingual `/en` and `/de` routes, SSR/prerendering, and paired Markdown blog content.

## Directory map

- `src/app/app.ts`, `app.html` — application shell, sticky header, theme controls, locale navigation, and router outlet.
- `src/app/core/` — app-wide domain data and types; non-UI code only.
- `src/app/shared/components/` — reusable UI primitives such as the footer and inline icon component.
- `src/app/pages/` — lazy-loaded route screens, organized in one folder per route.
- `src/styles.css` — Tailwind CSS v4 import, semantic design tokens, theme variables, and global base styles. Keep page and component styling in Tailwind utility classes in templates.
- `src/app/app.routes.ts` — locale-prefixed client routes.
- `src/app/app.routes.server.ts` — prerender parameters for both locales and every generated article.
- `src/server.ts` — Express SSR entry point; it also caches and exposes `/api/github-contributions` from GitHub's public contribution markup.
- `blog/` — authored Markdown source; each published post must have both `.en.md` and `.de.md` files.
- `scripts/generate-blog.mjs` — validates front matter, pairs locales, safely renders Markdown, and writes generated data.
- `src/app/core/data/blog-data.ts` — generated file; do not edit by hand.
- `src/locale/` — Angular XLIFF source/German catalogs. Production currently uses route-level `/en`/`/de` content (`localize: false`), so do not assume Angular emits separate localized builds.
- `public/robots.txt`, `public/sitemap.xml` — crawler policy and current public URL map.
- `Dockerfile` — multi-stage Node 22 build/runtime image; runs the production build and serves port 4000.
- `kubernetes/` — Flux-managed Kubernetes manifests: Deployment, Service, Traefik HTTPRoute/middleware, SOPS-encrypted Secret/hostnames, and image automation.
- `.sops.yaml` — encryption rules for selected Kubernetes manifest fields; never commit decrypted values or `*.dec.yaml` files.
- `design/` — supplied visual reference screenshots and assets, not application source.

## Local development and validation

Use pnpm 12 (`packageManager` is pinned in `package.json`):

```sh
pnpm install
pnpm start                         # Angular development server
pnpm generate:blog                 # validate and regenerate blog data
pnpm build                         # production browser/server build and prerender
pnpm exec ng test --watch=false --headless
pnpm exec prettier --check path/to/changed-file
pnpm serve:ssr:webpage             # serve the latest dist/webpage build on port 4000
```

`pnpm build` runs `scripts/generate-blog.mjs` first. It prerenders home and writing-index routes for both locales plus every published localized article; SSR remains available for unknown routes and the not-found UI. Tests use Angular's unit-test builder with Vitest/jsdom; the current test command may report that the `headless` flag is ignored because no browser is configured.

## Content authoring

Create paired files such as `blog/my-post.en.md` and `blog/my-post.de.md`. Every file requires this front matter:

```yaml
---
slug: my-post
title: A post title
description: A concise SEO description.
date: 2025-01-31
draft: false
---
```

The slug must equal the filename slug. Dates must be `YYYY-MM-DD`; `draft: true` excludes a file from generated output. Both locales must exist before a slug can publish. The local renderer supports headings, paragraphs, unordered lists, fenced code, inline code, bold text, and safe external links. Raw HTML is not emitted, and input is HTML-escaped before rendering. Markdown content is inserted only from the generated escaped renderer output.

## Implementation conventions

- Keep components standalone, `OnPush`, and signal/inject-based; prefer explicit typed fields over `any`.
- Use strict TypeScript, two-space indentation, single quotes, and the repository Prettier configuration (100-column width, Angular HTML parser).
- Use Tailwind CSS v4 utilities for page and component styling. Preserve semantic token classes (`paper`, `surface`, `ink`, `muted`, `line`, `soft-line`, `accent`) and the existing variable-based light/dark theme rather than adding component CSS.
- Keep user-facing copy conspicuous and easy to replace until real biography, projects, URLs, contact details, stack, and FAQ content is supplied.
- Preserve semantic headings, landmarks, keyboard-focusable controls, readable contrast, and the narrow-screen header behavior.
- Use `/en/...` and `/de/...` equivalents for language switching. Add alternate/canonical metadata when adding new localized content.
- Keep placeholder external destinations clearly marked until real destinations are provided.

## SEO, rendering, and deployment

Page titles/descriptions are set by route page components. Article pages add canonical, alternate-language, Open Graph, article-date, and BlogPosting metadata. The home page includes Person JSON-LD. Keep `sitemap.xml` in sync when adding or removing public routes. `angular.json` contains SSR host allow-list entries for local validation and fanto.dev.

`src/server.ts` caches the public GitHub contribution response for one hour, uses stale cached data after upstream failures, and otherwise returns a 502 that the home page handles. Preserve the browser-only `afterNextRender` fetch when changing that feature.

Build and publish the application as the Docker image defined in `Dockerfile`. Flux image automation owns the image tag in `kubernetes/kustomization.yaml`; avoid manually fighting its `main-<build>` updates. SOPS encrypts values in `kubernetes/secret.yaml` and `kubernetes/httproute.yaml`; decrypt/edit/re-encrypt only with the appropriate SOPS credentials. The ignored `*.dec.yaml` files are local decrypted copies.

Before submitting changes, run the blog generator, Prettier check only on changed formattable paths (the supplied `design/` assets and several legacy config files are not clean under a repository-wide check), unit tests, and a production build. For SSR changes, also curl both `/en` and `/de` pages from `pnpm serve:ssr:webpage` and verify document language, title, localized text, and article HTML.
