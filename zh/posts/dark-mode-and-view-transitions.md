---
title: "深色模式与 View Transitions"
description: Paper 主题的客户端增强功能。
created_at: 2026-06-26T10:00:00Z
updated_at: 2026-07-24T10:27:58+08:00
tags:
  - features
---

Paper 主题包含：

1. **深色模式** —— 通过顶部按钮切换，偏好保存在 `localStorage`
2. **View Transitions** —— 站内导航平滑过渡，无需整页刷新
3. **Algolia 搜索** —— 配置 `algolia_search` 后，通过 `plugin-in-search` 在顶部显示搜索浮层

这些功能属于渐进增强；即使不启用 JavaScript，站点仍可正常使用。

## 外链与 View Transitions

顶栏通过 `header_nav` 或绝对 `about` 配置的外链默认新窗口打开，**不会**走 View Transition，而是正常跳转。站内相对链接仍使用平滑过渡。

更多配置见 [[readme#顶栏链接-header_nav]]。
