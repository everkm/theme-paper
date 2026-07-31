---
id: 1784862019956
title: "Getting Started with Paper"
description: How to use Paper Theme with everkm-publish.
created_at: 2026-06-27T10:00:00Z
updated_at: 2026-07-31T11:48:28+08:00
tags:
  - guide
---

## Install the theme

Install Paper Theme via everkm-publish and set it in your site's `everkm.yaml`.

## Content structure

```text
your-site/
├── _home.md          # Hero content for virtual homepage
├── _about.md         # About page (virtual template)
└── posts/
    └── *.md          # Blog posts
```

## Featured posts

Add the `featured` tag to surface posts on the homepage:

```yaml
tags:
  - featured
```

## Custom header links

Configure `header_nav` in `__everkm/everkm.yaml` to add external or in-site links to the top nav. They appear after About by default; set `at_before: true` to place them before the posts list.

```yaml
config:
  header_nav:
    - title: Everkm
      url: https://everkm.com
      at_before: true
```

You can also set `about` to an absolute URL so the header About item opens an external page. Full field reference: [[readme]].

## Typography samples

> Blockquotes use a left accent border and reduced opacity, matching Astro Paper.

Inline `code` uses a muted background. Fenced blocks:

```javascript
export function hello(name) {
  console.log(`Hello, ${name}!`);
}
```

| Feature | Status |
| --- | --- |
| Dark mode | ✅ |
| View Transitions | ✅ |
| Algolia search | ✅ (with `algolia` config) |

- Unordered list item
- Another item with **bold** and _italic_

1. Ordered list
2. Second step

End of typography demo.
