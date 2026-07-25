---
id: 1784862019952
title: Changelog
slug: changelog
created_at: 2026-06-28T00:00:00Z
updated_at: 2026-07-25T14:41:00+08:00
tags:
  - featured
---

{#private}
This changelog is for end users. Keep the wording user-friendly and avoid exposing internal technical details.

- Maintain the corresponding Chinese version at `../zh/CHANGELOG.md` when updating
- The date in parentheses after the version number is the release date
- When no new version is specified, append entries under the latest version


## v0.1.2 (2026-07-25)

**Fixes**

- Embedded cards in post content (such as the Flash player) now load their styles and scripts correctly instead of showing empty placeholders
- Navigating away from deep on a long page no longer plays a lengthy “scroll back to top” style transition

**Improvements**

- Clearer card spacing and summary styles in post lists; titles clamp to two lines on narrow screens
- More balanced post title size on article pages
- Long previous / next post titles truncate to a single line to avoid layout overflow
- Added `body_end_html` config option to append custom HTML at the bottom of every page, for analytics scripts, live chat widgets, and other third-party integrations
- On multilingual sites, theme settings (site info, navigation, pagination, search, etc.) now resolve correctly for the current language
- Incomplete navigation items missing a title or URL are skipped to avoid a broken header
- In-site navigation now shows a top progress bar while the next page loads, so clicks no longer feel unresponsive

## v0.1.1 (2026-07-24)

**Fixes**

- Content image lazy loading: images now load when they enter the viewport (including above the fold), instead of staying on placeholders
- Hovering one header nav item no longer turns the other items accent-colored

**Improvements**

- Better style compatibility on older browsers and embedded webviews
- Header supports custom `header_nav` links (after About by default; use `at_before` to place earlier)
- `about` can be an absolute URL; external links open in a new tab and skip view transitions

## v0.1.0 (2026-06-28)

**Initial release**

- **Blog layout**
  - Minimal, responsive blog design migrated from Astro Paper
  - Tailwind CSS v4 design tokens with light and dark mode support
  - Virtual homepage with hero section, featured posts, and recent posts

- **Virtual pages**
  - Homepage (`/index.html`), posts list, tags index, tag posts, archives, and about page
  - Paginated posts list and tag pages

- **Posts**
  - Featured posts via the `featured` tag on the homepage
  - Post detail pages with tags, date, and back navigation
  - Archives grouped by year and month

- **Features**
  - Dark mode toggle with localStorage persistence
  - View Transitions for smooth in-site navigation
  - View Transitions restore scroll position on navigation (top of page, or hash target)
  - Algolia full-text search in the header via `plugin-in-search` (when `algolia_search` is configured)
  - Optional archives button and back button on post pages

- **Rendering**
  - Server-side code highlighting (`code_highlight.server`)
  - Server-side math rendering via Typst (`math_render.server`)
  - Typography styles aligned with Astro Paper (blockquotes, footnotes, definition lists)

- **Configuration**
  - Site info, social links, copyright, and post pagination via `everkm.yaml`
  - Homepage and about content from `_home.md` and `_about.md` via inner links
  - Social links with bundled icons when `name` matches a known platform (case-insensitive); otherwise shows text
