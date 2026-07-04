---
title: "Paper 入门指南"
description: 如何在 everkm-publish 中使用 Paper 主题。
created_at: 2026-06-27T10:00:00Z
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
