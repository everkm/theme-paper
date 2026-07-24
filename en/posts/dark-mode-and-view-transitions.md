---
title: "Dark Mode and View Transitions"
description: Client-side enhancements in Paper Theme.
created_at: 2026-06-26T10:00:00Z
updated_at: 2026-07-24T10:31:14+08:00
tags:
  - features
---

Paper Theme includes:

1. **Dark mode** — toggled via the header button, persisted in `localStorage`
2. **View Transitions** — smooth in-site navigation without full page reloads
3. **Algolia search** — header search overlay via `plugin-in-search` when `algolia_search` is configured

These features are progressive enhancements; the site remains fully usable without JavaScript.

## External links and View Transitions

External links configured via `header_nav` or an absolute `about` URL open in a new tab by default and **do not** use View Transitions — they navigate normally. In-site relative links still use smooth transitions.

See [[readme#header-links-header_nav]] for configuration details.
