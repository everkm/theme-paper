---
id: 1783174071337
title: "归档与分页"
description: 按日期浏览文章，或在列表中翻页。
created_at: 2026-06-20T08:00:00Z
updated_at: 2026-07-25T20:10:29+08:00
tags:
  - features
---

Paper 主题提供两种方式浏览较早内容。

## 归档

访问 `/archives/index.html` 可查看按年月分组的所有文章。可通过 `features.show_archives` 控制是否显示顶部归档图标。

归档会拉取全部文章（自动分页越过接口默认每页上限）。按「年 → 月 → 文章」纵向分组；每条只显示标题与日期：大屏同一行（日期右对齐），小屏两行。

## 分页

文章列表与标签页均支持分页：

- 第 1 页：`/posts/index.html`
- 第 2 页：`/posts/index.p2.html`

在 `everkm.yaml` 中配置 `posts.per_page` 可调整每页数量（默认：4）。
