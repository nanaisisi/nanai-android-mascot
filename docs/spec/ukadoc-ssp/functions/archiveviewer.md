# アーカイブビューワ

- **規格**: [functions/archiveviewer.md](https://ukatech.shillest.net/ukadoc-ssp/functions/archiveviewer/) (ukadoc-ssp/functions/archiveviewer.md)
- **対応状況**: ⚠️ 一部対応

## 突合結果

VFS 内部ファイル（nar/zip）のプレビューツール（計画中）


## 実装箇所

- `ui/ts/core/actions/menu-action-system.ts:29` `if (action === "pictureviewer" || action === "archiveviewer") {`
- `ui/ts/ui/submenu-renderer.ts:184` `{ action: "archiveviewer", label: "アーカイブビューワ", shortcut: "" },`
