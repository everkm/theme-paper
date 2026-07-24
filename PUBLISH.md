# Paper 主题发布交接

本文档说明如何将 `theme-paper` 正式发版、同步主题索引，以及如何用演示站预览未正式发布的主题改动。

## 前置条件

- 已安装并登录 [GitHub CLI](https://cli.github.com/)（`gh auth status` 正常）
- 本地 remote 名为 `github`（指向 `everkm/theme-paper`）
- 发版相关命令均在 `__everkm/` 目录执行

## 发版前准备

参考根目录 [`PROMPT.md`](./PROMPT.md)，在打 tag 前完成：

1. **版本号**（两处保持一致）
   - `__everkm/theme/paper/everkm-theme.yaml` → `version`
   - `__everkm/theme/paper/package.json` → `version`
2. **Changelog**（面向终端用户）
   - 先写 `zh/CHANGELOG.md`，再同步 `en/CHANGELOG.md`
   - 格式：`## vX.Y.Z (YYYY-MM-DD)`，日期用 Asia/Shanghai
3. **内容同步**：`zh/` 的改动翻译并同步到 `en/`
4. 提交并推送到 `master`（或当前主分支），确认工作区干净

## 正式发版步骤

### 1. 打版本 tag 并推送

```bash
cd __everkm
make tag TAG=v0.1.1
```

说明：

- tag 格式必须是 `v*`（如 `v0.1.1`），会触发 CI
- `make tag` 会执行 `git tag -f` + `git push -f github <TAG>`，可覆盖同名 tag
- **不要**用 `pages@v*` 做主题发版；那是演示站静态资源发布（见下文）

### 2. 等待 CI 构建预发布

推送 `v*` tag 后，[Theme Release](./.github/workflows/build.yaml) 工作流会：

1. 构建主题包 `paper-<version>.zip`
2. 创建 **prerelease**（预发布），附带 zip 资源

可在仓库 Releases / Actions 页面确认成功后再继续。

### 3. 晋升为 latest

```bash
cd __everkm
make set-latest
```

该命令会：

- 读取 `en/CHANGELOG.md` 与 `zh/CHANGELOG.md` 中对应版本说明（任一缺少条目会中止）
- 将最新（或指定）Release 从 prerelease 改为正式版，并设为 **latest**
- Release notes 格式：官方网站 → 英文内容 → `---` 分割线 → 中文内容

成功时输出类似：

```text
[INFO] promoting everkm/theme-paper v0.1.1 to latest release
https://github.com/everkm/theme-paper/releases/tag/v0.1.1
[INFO] done: everkm/theme-paper v0.1.1
```

### 4. 同步主题索引

```bash
cd __everkm
make push-index-themes
```

会触发 `everkm/themes` 仓库的 `publish-theme.yaml`（`mode=single`，`full_name=everkm/theme-paper`），把本主题写入索引。

关注 Actions 运行状态，例如：

```text
https://github.com/everkm/themes/actions/runs/<run_id>
```

## 命令速查

| 步骤 | 命令 | 作用 |
|------|------|------|
| 打 tag | `make tag TAG=vX.Y.Z` | 强制打 tag 并推送，触发主题构建 |
| 晋升正式版 | `make set-latest` | 用 Changelog 晋升为 latest Release |
| 更新索引 | `make push-index-themes` | 触发 `everkm/themes` 收录本主题 |
| 预览演示站 | `make tag TAG=pages@vX.Y.Z.N` | 现编译主题并导出，force 推到 `pages` |

以上均在 `__everkm/` 下执行。

## 演示站（pages）预览发布

用途：在主题 **尚未** `v*` 正式发版前，把当前分支上的主题改动导出到演示站（如 [paper.theme.everkm.com](https://paper.theme.everkm.com)），便于预览。

与主题 zip 发版（`v*`）**无关**，不要混用。

### 版本号

演示站 tag 使用 **四位** 版本号：`pages@vX.Y.Z.N`

| 段 | 含义 |
|----|------|
| `X.Y.Z` | 与**即将发布**的主题版本一致（对应 `everkm-theme.yaml` / `package.json` 的 `version`，正式发版 tag 为 `vX.Y.Z`） |
| `N` | 该主题版本下的演示站构建序号，从 `0` 起递增（同一次待发版周期内多次预览则 `0` → `1` → `2` …） |

示例：即将发 `v0.1.3` 时，演示站依次为 `pages@v0.1.3.0`、`pages@v0.1.3.1` …

### 流程

```bash
# 1. 确认在要预览的提交上（通常是已推送的 master），工作区干净
git checkout master
git pull github master
git status

# 2. 打演示站 tag 并推送（四位；前三位 = 即将发布的主题版本）
cd __everkm
make tag TAG=pages@v0.1.3.0
```

CI（`pages@v*`）会按顺序：

1. **现编译主题**：`cd __everkm/theme/paper && make build`  
   - 重新生成 `templates/everkm-render.js` 与客户端静态资源  
   - **不**直接使用仓库里上次提交的旧 `everkm-render.js`
2. **导出站点**：`make export-all`（`--theme-dev`，基于刚编译的本地主题）
3. 将 `__everkm/dist/` **force 推**到 `pages` 分支

本地等价命令：

```bash
cd __everkm
make dist   # = make build（主题）+ make export-all
```

### 注意

1. **tag 落在哪次提交，演示站就是哪次提交的产物。**  
   若在 detached HEAD / 旧 tag 上执行 `make tag TAG=pages@…`，会把演示站覆盖成旧版本（即使之前已发布过更新的 `pages@v*`）。
2. **后推送的 `pages@v*` 会覆盖先推送的。** 演示站始终以最近一次成功的 pages 构建为准，与 tag 号大小无关。
3. 需要预览未推送的本地改动时：先 commit（并 push 到 `github`），再在该提交上打 `pages@vX.Y.Z.N`。
4. 演示站使用 CI 安装的 `everkm-publish`（见 `__everkm/package.json`），与本地 `DEBUG=` 自定义二进制可能不一致。

## 常见注意点

1. **正式发版顺序**：先推代码 → 再 `v*` tag → 等 CI 出 prerelease → `set-latest` → `push-index-themes`
2. **Changelog 必填**：`set-latest` 强依赖 `en/CHANGELOG.md` 与 `zh/CHANGELOG.md` 中均存在 `## vX.Y.Z` 且内容非空
3. **重打 tag**：`make tag` 使用 `-f`，适合修包后覆盖同一版本；覆盖后需重新等 CI，再视情况执行 `set-latest`
4. **权限**：`gh` 需能读写本仓库 Release，以及触发 `everkm/themes` 的 workflow_dispatch
5. **预览 vs 发版**：想看未发版主题效果 → `pages@vX.Y.Z.N`（四位）；要给用户装的主题包 → `vX.Y.Z`（三位）+ `set-latest` + `push-index-themes`
