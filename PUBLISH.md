# Paper 主题发布交接

本文档说明如何将 `theme-paper` 正式发版，并同步到主题索引仓库 `everkm/themes`。

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

- 读取 `zh/CHANGELOG.md` 中对应版本说明（缺少条目会中止）
- 将最新（或指定）Release 从 prerelease 改为正式版，并设为 **latest**
- Release notes 以 Changelog 内容为准

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

以上均在 `__everkm/` 下执行。

## 可选：演示站（pages）发布

若需发布演示站静态产物到 `pages` 分支，使用：

```bash
cd __everkm
make tag TAG=pages@v0.1.1
```

- 触发同一工作流中的 `pages@v*` 分支逻辑
- 导出站点并 force 推到 `pages` 分支
- **与主题 zip 发版无关**，不要与 `v*` 发版步骤混淆

## 常见注意点

1. **顺序**：先推代码 → 再 `v*` tag → 等 CI 出 prerelease → `set-latest` → `push-index-themes`
2. **Changelog 必填**：`set-latest` 强依赖 `zh/CHANGELOG.md` 中存在 `## vX.Y.Z` 且内容非空
3. **重打 tag**：`make tag` 使用 `-f`，适合修包后覆盖同一版本；覆盖后需重新等 CI，再视情况执行 `set-latest`
4. **权限**：`gh` 需能读写本仓库 Release，以及触发 `everkm/themes` 的 workflow_dispatch
