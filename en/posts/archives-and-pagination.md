---
id: 1782950885143
title: "Archives and Pagination"
description: Browse posts by date or page through lists.
created_at: 2026-06-20T08:00:00Z
updated_at: 2026-07-25T20:10:29+08:00
tags:
  - features
---

Paper Theme provides two ways to explore older content.

## Archives

Visit `/archives/index.html` to see all posts grouped by year and month. Enable or disable the archives icon via `features.show_archives`.

Archives fetch every matching post (paging past the API default page size). Entries are grouped as year → month → posts. Each entry shows title and date only: one row on large screens (date right-aligned), two lines on small screens.

## Pagination

The posts list and tag pages support pagination:

- Page 1: `/posts/index.html`
- Page 2: `/posts/index.p2.html`

Configure `posts.per_page` in `everkm.yaml` to change the page size (default: 4).
