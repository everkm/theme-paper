---
title: "Paper 入门指南"
description: 如何在 everkm-publish 中使用 Paper 主题。
created_at: 2026-06-27T10:00:00Z
updated_at: 2026-07-24T10:27:58+08:00
tags:
  - guide
---

## 安装主题

通过 everkm-publish 安装 Paper 主题，并在站点的 `everkm.yaml` 中启用。

## 内容结构

```text
your-site/
├── _home.md          # 虚拟首页首屏内容
├── _about.md         # 关于页（虚拟模板）
└── posts/
    └── *.md          # 博客文章
```

## 精选文章

添加 `featured` 标签，即可在首页展示文章：

```yaml
tags:
  - featured
```

## 顶栏自定义链接

在 `__everkm/everkm.yaml` 中配置 `header_nav`，可在顶栏追加外链或站内链接。默认排在「关于」之后；设置 `at_before: true` 可提前到文章列表之前。

```yaml
config:
  header_nav:
    - title: 毓知
      url: https://everkm.cn/
      at_before: true
```

也可将 `about` 设为绝对 URL，让顶栏「关于」直接跳转到站外页面。完整字段说明见 [[readme]]。

## 排版示例

> 引用块使用左侧强调边框并降低不透明度，与 Astro Paper 风格一致。

行内 `code` 使用柔和背景。围栏代码块：

```javascript
export function hello(name) {
  console.log(`Hello, ${name}!`);
}
```

| 功能 | 状态 |
| --- | --- |
| 深色模式 | ✅ |
| View Transitions | ✅ |
| Algolia 搜索 | ✅（需配置 `algolia_search`） |

- 无序列表项
- 另一项，含 **粗体** 与 _斜体_

1. 有序列表
2. 第二步

排版演示结束。
