---
title: 主题配置
slug: readme
created_at: 2026-06-28T00:00:00Z
updated_at: 2026-07-24T10:31:14+08:00
tags:
  - featured
---



# 主题配置

Paper 是面向 [everkm-publish](https://publish.everkm.com) 的极简博客主题，默认模板为 `post`。站点级配置放在工作区 `__everkm/everkm.yaml` 的 `config` 节点下；内容目录的 URL 规则在 `folders` 中设置。

## 配置概览

```yaml
# __everkm/everkm.yaml

config:
  site: { ... }           # 站点基本信息
  home: '[[_home]]'       # 首页首屏内容
  about: '[[_about]]'     # 关于页内容，或绝对 URL
  posts: { ... }          # 文章列表分页与精选标签
  features: { ... }       # 功能开关
  header_nav: [ ... ]     # 顶栏额外链接（默认在「关于」后，可 at_before）
  code_highlight: { ... } # 服务端代码高亮
  math_render: { ... }    # 服务端数学渲染
  socials: [ ... ]        # 社交链接（首页首屏与页脚）
  share_links: [ ... ]    # 文章页分享链接
  copyright: { ... }      # 页脚版权

folders:
  "/":
    url_slug: posts
    url_id_suffix: true
```

---

## 站点信息 `site`

| 字段 | 类型 | 说明 |
|--------|------|------|
| `site.name` | string | 站点名称，用于页面标题、页眉、页脚等 |
| `site.description` | string | 站点描述（发布系统元数据） |
| `site.author` | string | 作者名称 |
| `site.profile` | string | 作者主页 URL |
| `site.lang` | string | 站点语言，如 `en`、`zh` |
| `site.timezone` | string | 日期显示时区，如 `UTC`、`Asia/Shanghai` |
| `site.dir` | string | 文本方向，`ltr` 或 `rtl` |

示例：

```yaml
config:
  site:
    name: 我的博客
    description: 基于 Paper 主题的个人博客
    author: 张三
    lang: zh
    timezone: Asia/Shanghai
```

---

## 虚拟页面 `home` / `about`

Paper 使用**虚拟模板**实现首页与关于页。首屏与关于页正文来自通过内链引用的 Markdown 文件：

| 字段 | 默认值 | 说明 |
|--------|---------|-------------|
| `home` | `[[_home]]` | 首页首屏 Markdown 路径（通过内链解析） |
| `about` | `[[_about]]` | 关于页 Markdown 路径；也可设为绝对 URL（见下） |

示例内容结构：

```text
zh/
├── _home.md          # 首页首屏（必需）
├── _about.md         # 关于页（必需）
├── README_CN.md      # 主题配置文档
├── CHANGELOG.md      # 更新日志
└── posts/
    └── *.md          # 博客文章
```

{.NOTE}
**不要**在根目录创建 `index.md`。若 `/index.html` 解析到某篇 Markdown，会按普通文章详情页渲染，而非虚拟首页。

### `about` 使用绝对链接

若「关于」指向站外页面，可将 `about` 设为 `http(s)://` 绝对地址。顶栏「关于」会直接打开该链接（新窗口，且不走 View Transition），本地 `/about/` 虚拟页将不再加载 Markdown 正文。

```yaml
config:
  about: https://example.com/about
```

---

## 顶栏链接 `header_nav`

在顶栏追加自定义链接，可与内置导航（文章 / 标签 / 关于）混排。

**默认顺序：**

搜索（若启用）→ `at_before: true` 的项 → 文章 → 标签 → 关于 → 其余 `header_nav` → 归档 → 主题切换

| 字段 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `title` | string | — | 显示文案 |
| `url` | string | — | 链接地址；`http(s)://` 为外链，相对路径按站点根解析 |
| `new_window` | boolean | 外链为 `true` | 是否新窗口打开 |
| `at_before` | boolean | `false` | `true` 时排在内置导航之前；`false` 时排在「关于」之后、「归档」之前 |

外链会带上 `data-no-vt`，并在默认新窗口时附带 `target="_blank"` / `rel="noopener"`，避免被 View Transition 拦截。

```yaml
config:
  header_nav:
    - title: 毓知
      url: https://everkm.cn/
      at_before: true
    - title: GitHub
      url: https://github.com/everkm/theme-paper
    - title: 文档
      url: https://publish.everkm.com
      new_window: true
```

`title` / `url` 也可使用 everkm-publish 的多语言写法（由发布系统按当前语言解析）：

```yaml
config:
  header_nav:
    - title:
        _default: Everkm
        zh: 毓知
      url:
        _default: https://everkm.com
        zh: https://everkm.cn/
      at_before: true
```

---

## 文章 `posts`

| 字段 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `posts.per_page` | number | `4` | 文章列表与标签页每页文章数 |
| `posts.per_index` | number | `4` | 首页展示的最新文章数（不含精选） |
| `posts.featured_tag` | string | `featured` | 用于在首页标记精选文章的标签 |

精选文章示例：

```yaml
---
title: 我的精选文章
tags:
  - featured
  - release
---
```

---

## 功能开关 `features`

| 字段 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `features.light_and_dark_mode` | boolean | `true` | 在页眉启用浅色/深色模式切换 |
| `features.show_archives` | boolean | `true` | 在页眉导航显示归档图标 |
| `features.show_back_button` | boolean | `true` | 在文章详情页显示返回按钮 |
| `features.view_transitions` | boolean | `true` | 启用站内 View Transitions 导航 |
| `features.edit_post.enabled` | boolean | `false` | 在文章页显示编辑链接 |
| `features.edit_post.url` | string | — | 编辑链接 URL 模板 |

示例：

```yaml
config:
  features:
    light_and_dark_mode: true
    show_archives: true
    show_back_button: true
    view_transitions: true
    edit_post:
      enabled: false
```

---

## 搜索 `algolia_search`

配置后，Algolia 全文搜索组件会出现在页眉（需要 `plugin-in-search` 构建产物）。

```yaml
config:
  algolia_search:
    app_id: YOUR_APP_ID
    api_key: YOUR_SEARCH_API_KEY
    index_name: your_index
    site: your-site-id
```

| 字段 | 说明 |
|------|------|
| `app_id` | Algolia Application ID |
| `api_key` | Algolia Search-Only API Key |
| `index_name` | 索引名称 |
| `site` | 站点标识（插件内部使用） |

---

## 代码高亮 `code_highlight`

Paper 通过 everkm-publish 支持服务端语法高亮：

```yaml
config:
  code_highlight:
    server: true
```

当 `server: true` 时，代码块在构建时使用 syntect 主题高亮，作用域为 `.app-prose`。

---

## 数学渲染 `math_render`

通过 Typst 的服务端数学渲染：

```yaml
config:
  math_render:
    server: true
    font_size: 14
```

| 字段 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `math_render.server` | boolean | — | 启用服务端数学渲染 |
| `math_render.font_size` | number | `14` | 渲染数学 SVG 的基础字号 |

在 Markdown 中使用 `$...$` 表示行内公式，`$$...$$` 表示块级公式。

---

## 社交链接 `socials`

显示在首页首屏与页脚：

```yaml
config:
  socials:
    - name: github
      url: https://github.com/everkm/theme-paper
    - name: everkm
      url: https://everkm.com
```

支持的 `name` 包括 `github`、`twitter`、`linkedin`、`mail` 等，主题内已映射为对应图标。

---

## 分享链接 `share_links`

文章详情页的可选分享链接：

```yaml
config:
  share_links:
    - name: twitter
      url: https://twitter.com/intent/tweet
    - name: facebook
      url: https://www.facebook.com/sharer/sharer.php
```

---

## 版权 `copyright`

```yaml
config:
  copyright:
    text: everkm
    link: https://everkm.com
```

---

## 目录规则 `folders`

Paper 默认主题配置将 `/` 下的内容映射到 `/posts/` URL：

```yaml
folders:
  "/":
    url_slug: posts
    url_id_suffix: true
```

| 字段 | 说明 |
|-------|-------------|
| `url_slug` | 该目录内容的 URL 前缀 |
| `url_id_suffix` | 为 `true` 时，URL 包含稳定 ID 后缀，如 `/posts/my-post-123.html` |

`__everkm/everkm.yaml` 中的站点级 `folders` 会**覆盖**主题默认值。

---

## 虚拟页面路由

Paper 提供以下虚拟页面（无需对应 Markdown 文件）：

| URL | 页面 | 说明 |
|-----|------|-------------|
| `/index.html` | 首页 | 首屏、精选文章、最新文章 |
| `/posts/index.html` | 文章列表 | 分页文章索引 |
| `/tags/index.html` | 标签索引 | 全部标签 |
| `/tags/{tag}/index.html` | 标签文章 | 按标签筛选的文章 |
| `/archives/index.html` | 归档 | 按年月分组的文章 |
| `/about/` | 关于 | 来自 `config.about` 的关于页；若 `about` 为绝对 URL，顶栏将外链打开 |

---

## 文章 Front Matter

博客文章常用字段：

| 字段 | 类型 | 说明 |
|------|------|------|
| `title` | string | 文章标题 |
| `description` | string | 用于 meta 与卡片的摘要 |
| `created_at` | string | 创建时间，RFC3339 格式 |
| `updated_at` | string | 更新时间，RFC3339 格式 |
| `slug` | string | URL 路径段 |
| `tags` | array | 用于筛选与精选标记的标签 |
| `draft` | boolean | 为 `true` 时，不进入公开列表 |

示例：

```yaml
---
title: 你好，世界
description: 我的第一篇博客。
created_at: 2026-06-28T10:00:00Z
tags:
  - featured
  - intro
---
```

若正文中第一个 `h1` 与 Front Matter 的 `title` 一致，渲染时会自动隐藏，避免标题重复。详见演示文章 [[everkm-markdown#heading]]。

---

## 内容 Markdown 扩展

Paper 继承 everkm-publish 的 Markdown 扩展。完整示例见演示文章 [[everkm-markdown]]，或 [Everkm Markdown 指南](https://publish.everkm.com/guide/everkm-markdown.html)。

支持的扩展包括：

- 内链 `[[...]]`
- 块级属性集 `{.class #id}`
- 链接与图片的行内属性集
- 宏（`macro/toc`、`macro/include`）
- 高亮 `==文本==`、上标、下标
- 定义列表、脚注、任务列表

---

## 阅读设置（浏览器端）

以下设置保存在用户浏览器本地，**不在** `everkm.yaml` 中配置：

- 浅色/深色模式偏好（启用 `features.light_and_dark_mode` 时）

通过页眉的太阳/月亮按钮切换。

---

## 主题元数据

| 项目 | 值 |
|----|-----|
| 主题名称 | `paper` |
| 默认模板 | `post` |
| 演示站点 | https://paper.theme.everkm.com/ |
| 仓库 | https://github.com/everkm/theme-paper |
