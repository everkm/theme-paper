## 通用规则

- 修改任意 Markdown 文件时，同步更新其 Frontmatter `updated_at`（Asia/Shanghai 当前时间）

## 发版更新流程

1. **版本号**（两处保持一致）
   - `__everkm/theme/paper/everkm-theme.yaml` → `version`（主题发布用）
   - `__everkm/theme/paper/package.json` → `version`

2. **Changelog**（面向终端用户，避免内部实现细节）
   - 先写 `zh/CHANGELOG.md`，再同步 `en/CHANGELOG.md`
   - 版本号后括号内为发布日期（Asia/Shanghai）
   - 未指定新版本时，条目追加到最新版本下

3. **内容同步**
   - 工作区 `zh/` 的内容改动，翻译并同步到 `en/` 对应文件
