---
title: Changelog
slug: changelog
created_at: 2026-06-28T00:00:00Z
tags:
  - featured
---

{#private}
This changelog is for end users. Keep the wording user-friendly and avoid exposing internal technical details.

- Maintain the corresponding Chinese version at `../zh/CHANGELOG.md` when updating
- The date in parentheses after the version number is the release date
- When no new version is specified, append entries under the latest version


## v0.1.0 (2026-06-28)

**Initial release**

- **Blog layout**
  - Minimal, responsive blog design migrated from Astro Paper
  - Tailwind CSS v4 design tokens with light and dark mode support
  - Virtual homepage with hero section, featured posts, and recent posts

- **Virtual pages**
  - Homepage (`/index.html`), posts list, tags index, tag posts, archives, search, and about page
  - Paginated posts list and tag pages

- **Posts**
  - Featured posts via the `featured` tag on the homepage
  - Post detail pages with tags, date, and back navigation
  - Archives grouped by year and month

- **Features**
  - Dark mode toggle with localStorage persistence
  - View Transitions for smooth in-site navigation
  - Pagefind client-side search on `/search/index.html`
  - Optional archives button and back button on post pages

- **Rendering**
  - Server-side code highlighting (`code_highlight.server`)
  - Server-side math rendering via Typst (`math_render.server`)
  - Typography styles aligned with Astro Paper (blockquotes, footnotes, definition lists)

- **Configuration**
  - Site info, social links, copyright, and post pagination via `everkm.yaml`
  - Homepage and about content from `_home.md` and `_about.md` via inner links
