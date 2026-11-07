# アーカイブビューワ

- **規格**: [functions/archiveviewer.md](https://ukatech.shillest.net/ukadoc-ssp/functions/archiveviewer/) (ukadoc-ssp/functions/archiveviewer.md)
- **対応状況**: ✅ 実装済

## 突合結果

VFS 内部ファイル（nar/zip）のプレビューツール（計画中）


## 実装箇所

- `ui/ts/core/app-actions.ts:127` `if (action === "pictureviewer" || action === "archiveviewer") {`
- `ui/ts/ui/submenu-renderer.ts:165` `{ action: "archiveviewer", label: "アーカイブビューワ", shortcut: "" },`
