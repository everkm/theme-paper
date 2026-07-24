# Tailwind CSS v4 → v3.4 降级迁移经验（Plan）

> **文档性质**：Plan（260724）  
> **状态**：v1.0（theme-paper 实战复盘，可供其它 Everkm 主题 / 前端项目复用）  
> **实战仓库**：`theme-paper/__everkm/theme/paper`  
> **关联**：原迁移方案中曾定稿 Tailwind v4（见 [260628-Plan-astro-paper迁移](./260628-Plan-astro-paper迁移theme-paper.md) §2 D8）；本文记录 **因浏览器兼容回退 v3.4** 的完整路径  
> **对比脚本**：[`stuff/visual-diff/compare.py`](../visual-diff/compare.py)

---

## 0. 变更记录

| 版本 | 日期 | 内容 |
|------|------|------|
| 1.0 | 260724 | 初稿：基于 theme-paper 实战，整理 v4→v3 决策、改动清单、坑点（`NaN%`）、构建与 Playwright 回归方法 |

---

## 1. 背景与目标

### 1.1 背景

1. Tailwind CSS **v4**（Oxide / CSS-first）为 2025+ 新项目默认选择，构建更快、配置入 CSS。
2. v4 **浏览器底线**较高（约 Safari 16.4+ / Chrome 111+ / Firefox 128+），核心依赖 `@property`、`color-mix()` 等，**无可靠 polyfill**。
3. **对外发布的主题 / 站点**若需覆盖旧 iOS、内嵌 WebView 等，官方建议 **留在 v3.4**。
4. theme-paper 已按 v4 落地（`@tailwindcss/postcss` + `@theme` / `@utility`），实测兼容性不足后执行 **降级到 v3.4**。

### 1.2 目标

1. 给出 **可复用的降级清单**（依赖、构建、配置、类名回退）。
2. 记录 **必踩坑**（尤其主题色 `colorVar` → `NaN%`）。
3. 给出 **视觉回归** 方法（Playwright 对比线上 Demo）。
4. 明确 **何时该降、何时不该降**，避免盲目跟风。

### 1.3 非目标

- 不讨论 v3→v4 升级（官方有 `@tailwindcss/upgrade`）。
- 不要求其它项目必须降级；本文是 **兼容优先时的操作手册**。
- 不覆盖 Sass/Less 与 v4 混用（v4 本就不支持预处理器）。

---

## 2. 业内选择结论（决策用）

| 场景 | 建议 |
|------|------|
| 新项目 + 现代浏览器 | **直接 v4** |
| 活跃旧项目 + 浏览器底线够 | 逐步升 v4 |
| **主题 / 对外站点 + 需旧浏览器** | **v3.4** |
| 维护模式、插件未就绪 | 留 v3.4 |

**一句话**：主流是按浏览器底线分流，不是版本信仰。主题类产品选 v3.4 换覆盖面是正当选择。

---

## 3. 可行性结论

| 问题 | 结论 |
|------|------|
| 能否「零改动」降级？ | **否**。v4 CSS-first API 与类名语法需手改。 |
| 能否功能等价？ | **能**。主题规模中等时约半天改动 + 半天验收。 |
| 有无官方降级工具？ | **无**（仅有 v3→v4 升级工具）。 |
| 最大风险 | ① 类名语义尺度（`rounded-sm` 等）反向映射；② **自定义色 + 透明度函数写错导致整站无色**（见 §7）。 |

---

## 4. 改动总览（checklist）

按顺序执行；打勾项对应 theme-paper 已完成路径。

### 4.1 依赖（`package.json`）

| # | 动作 |
|---|------|
| D-01 | 移除 `@tailwindcss/postcss` |
| D-02 | `tailwindcss` 钉在 **`^3.4.x`**（实战：3.4.19） |
| D-03 | 保留 `postcss`、`postcss-import`、`autoprefixer`（v3 需要；v4 曾可省略） |
| D-04 | `@tailwindcss/typography` 继续用 `0.5.x`，改为在 **JS config** 的 `plugins` 注册 |

### 4.2 构建（esbuild + PostCSS，如 `build.js`）

| # | 动作 |
|---|------|
| B-01 | `import tailwindcss from "tailwindcss"`（不再 `@tailwindcss/postcss`） |
| B-02 | 增加 nesting：`import tailwindNesting from "tailwindcss/nesting/index.js"`（**ESM 须写到 `index.js`**，否则 `ERR_UNSUPPORTED_DIR_IMPORT`） |
| B-03 | PostCSS 顺序：`[postcssImport, tailwindNesting, tailwindcss, autoprefixer]` |
| B-04 | v3 插件传 **函数引用** `tailwindcss`，不要 `tailwindcss()`（v4 postcss 包才是调用式） |

### 4.3 新建 `tailwind.config.js`（ESM）

| # | 内容 |
|---|------|
| C-01 | `content: ["./src/**/*.{js,jsx,ts,tsx}"]`（覆盖所有入口；多 CSS 包共享同一 config） |
| C-02 | `darkMode: ["selector", '[data-theme="dark"] &']`（对应原 v4 `@custom-variant dark`） |
| C-03 | `theme.extend.colors`：把原 `@theme inline { --color-* }` 映射为 JS colors |
| C-04 | `theme.extend.fontFamily` / `maxWidth` 等（如 `font-app`、`max-w-app`） |
| C-05 | `plugins: [typography]` |
| C-06 | 建议 `borderColor.DEFAULT` 指向主题 border token，避免 Preflight 默认 gray-200 |

### 4.4 CSS 入口改写

| # | v4 | v3 |
|---|----|----|
| S-01 | `@import "tailwindcss"` | `@tailwind base;` / `components;` / `utilities;` |
| S-02 | `@source "..."` | 由 `content` 扫描替代 |
| S-03 | `@plugin "@tailwindcss/typography"` | config `plugins` |
| S-04 | `@theme inline { --color-x: ... }` | config `theme.extend` + 普通 `:root` CSS 变量 |
| S-05 | `@utility foo { ... }` | `@layer utilities { .foo { ... } }` 或 `theme.extend` |
| S-06 | `@custom-variant dark (...)` | `darkMode: ['selector', ...]` |
| S-07 | `@import` 其它文件 | **必须放在文件顶部**（`postcss-import` 只可靠处理顶部 `@import`）；再写 `@tailwind` |

**推荐 `global.css` 骨架：**

```css
@import "./theme.css";
@import "./typography.css";
/* ...其它局部样式... */

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  /* 全局 base */
}

@layer utilities {
  .app-layout { @apply max-w-app mx-auto w-full px-4; }
}
```

**`theme.css`**：只保留运行时 CSS 变量（`--background` / `--foreground` / …），**删除** `@theme` 块。

### 4.5 类名 / `@apply` 语法回退

| # | v4 | v3 |
|---|----|----|
| N-01 | `bg-(--shiki-light-bg)` | `bg-[var(--shiki-light-bg)]` |
| N-02 | `wrap-break-word` | `break-words` |
| N-03 | `my-6!` / `no-underline!` | `!my-6` / `!no-underline` |
| N-04 | `translate-[-50%]` | `-translate-x-1/2 -translate-y-1/2` |
| N-05 | `inset-s-16` | `start-16` |
| N-06 | 尺度类 `rounded` / `shadow-sm` / `backdrop-blur-sm` | 按 [Upgrade guide](https://tailwindcss.com/docs/upgrade-guide) **反向**核对视觉（v4 重命名过默认档） |

多入口 CSS（如主站 `paper.css` + 插件 `plugin-in-search.css`）时：插件 CSS 仍需 `@tailwind` 指令，否则独立 chunk 不含工具类。

---

## 5. 主题色与透明度（高优先级）

### 5.1 问题

v3 中若颜色写成普通 `var(--muted)`，**不支持** `bg-muted/75` 这类 opacity modifier，`@apply` 会直接报错。

若用函数自定义颜色以支持 `/75`，又容易踩下一节的 **`NaN%` 坑**。

### 5.2 推荐实现（theme-paper 定稿）

```js
function colorVar(name) {
  return ({ opacityValue }) => {
    if (opacityValue === undefined) {
      return `var(${name})`;
    }
    const n =
      typeof opacityValue === "number" ? opacityValue : Number(opacityValue);
    if (Number.isFinite(n)) {
      return `color-mix(in srgb, var(${name}) ${n * 100}%, transparent)`;
    }
    // Tailwind 可能传入非数字（--tw-*-opacity 管道）；不可 Number() 后写入
    return `var(${name})`;
  };
}

// theme.extend.colors.background = colorVar("--background")
// ...
```

### 5.3 错误写法后果（实战）

错误地把任意 `opacityValue` 都做 `Number(opacityValue) * 100`，生成：

```css
.bg-background {
  background-color: color-mix(in srgb, var(--background) NaN%, transparent);
}
```

浏览器丢弃非法声明 → **`bg-background` / `text-foreground` / `border-border` 全部失效** → 页面呈默认黑字 + 透明背景，暗色对比接近 100% 像素差。  
**CSS 变量本身仍正确**，极易误判为「暗色逻辑坏了」。

### 5.4 验收口令

构建后检查产物 CSS：

```bash
# 应类似：background-color:var(--background)
# 禁止出现：NaN%
rg 'NaN%' dist/assets/*.css && echo 'FAIL' || echo 'OK'
rg -o '.bg-background\{[^}]+\}' dist/assets/paper.*.css
```

---

## 6. Dark mode

| 项 | 说明 |
|----|------|
| 运行时 | `document.documentElement` / root 上 `data-theme="light\|dark"` + `:root` / `[data-theme="dark"]` 变量块 |
| Tailwind | `darkMode: ["selector", '[data-theme="dark"] &']` |
| 注意 | `dark:` 变体与 CSS 变量块是两套机制；变量负责色板，`dark:` 负责工具类切换 |

---

## 7. 视觉回归（Playwright + Python）

### 7.1 环境

```bash
python3 -m venv ~/.venv
~/.venv/bin/pip install playwright pillow numpy
~/.venv/bin/playwright install chromium
```

### 7.2 对比对象

- **线上**：主题 Demo（如 `https://paper.theme.everkm.com/`）
- **本地**：`everkm-publish serve`（注意语言：`EVERKM_LANG=en make work`，避免 zh/en 内容差干扰像素对比）
- **先构建**：`make jsrender-build`（或项目等价命令）

### 7.3 脚本能力（`stuff/visual-diff/compare.py`）

1. 多页面 × light/dark 全页截图  
2. 像素差百分比 + diff 热图  
3. 关键节点 computed style / CSS 变量对比  

### 7.4 解读像素差

| 差量 | 含义 |
|------|------|
| home/tags ≈ 0–0.2% | 样式对齐良好 |
| about 数百分点 | 先查 **内容/图片是否一侧缺失**，勿先改 CSS |
| archives 数百分点 | 常为 **列表排序/文案** 不同 |
| dark ≈ 100% 且 vars 仍正确 | 优先查 **工具类是否 NaN%/未生成**（§5） |
| post 404 | 核对是否带 **url_id 哈希** 的真实路径 |

### 7.5 theme-paper 复盘数据（260724）

| 页面 | 修复 `NaN%` 前 | 修复后 |
|------|----------------|--------|
| home light/dark | ~2% / ~100% | ~0.18% / ~0.19% |
| tags | — | ~0% |
| post（正确 URL） | — | ~0.2–0.5% |
| about | — | ~7.6%（本地多图，非 CSS） |

---

## 8. 建议操作顺序（其它项目复用）

1. **确认动机**：是否真需要旧浏览器；否则优先留 v4。  
2. **分支**：单独 branch，勿与功能开发混杂。  
3. 按 §4 改依赖 → 构建 → config → CSS → 类名。  
4. **先构建产物**，用 §5.4 检查 `NaN%` 与 `.bg-background`。  
5. 浏览器手测：首页 / 文章 / 暗色 / 独立 CSS 插件（搜索浮层等）。  
6. 有线上 Demo 时跑 §7 对比；剔除内容噪音后再改样式。  
7. 更新主题 Changelog（用户向，避免堆砌内部类名细节）。

---

## 9. 文件映射（theme-paper 实战）

| 编号 | 路径 | 角色 |
|------|------|------|
| F-01 | `package.json` | 依赖版本 |
| F-02 | `build.js` | PostCSS 插件链 |
| F-03 | `tailwind.config.js` | **新建**；主题、dark、typography、`colorVar` |
| F-04 | `src/assets/css/global.css` | 入口：`@tailwind` + `@layer` |
| F-05 | `src/assets/css/theme.css` | 仅 CSS 变量 |
| F-06 | `src/assets/css/typography.css` | 去掉 `@plugin`；类名回退 |
| F-07 | `src/lib/plugins/in_search/FloatSearch.css` | 独立入口仍需 `@tailwind` |
| F-08 | `src/lib/proseClasses.ts`、`src/layout/Header.tsx` 等 | 模板类名回退 |
| F-09 | `stuff/visual-diff/compare.py` | 回归脚本 |

---

## 10. 风险与后续

| 编号 | 风险 / 事项 | 缓解 |
|------|-------------|------|
| R-01 | v3/v4 默认尺度不一致 | 关键页面截图；必要时显式 `rounded-xs` 等 |
| R-02 | 多 CSS 入口重复打入 utilities | 可接受；后续可拆 content 或抽共享包 |
| R-03 | `color-mix` 在极旧浏览器仍不可用 | 仅用于 opacity 修饰；核心实色走 `var(--*)` |
| R-04 | 未来若官方提供 v4 compatibility mode | 再评估升回 v4，避免长期双栈 |

---

## 11. 参考

1. [Tailwind Upgrade guide](https://tailwindcss.com/docs/upgrade-guide)（v3↔v4 破坏性对照；降级时反向使用）  
2. [Tailwind Compatibility](https://tailwindcss.com/docs/compatibility)（浏览器底线）  
3. 本仓库原 v4 定稿讨论：[260628-Plan-astro-paper迁移theme-paper.md](./260628-Plan-astro-paper迁移theme-paper.md)
