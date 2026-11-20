# 圧縮時のパスワード設定

- **規格**: [archiveviewer.md](../../../../../docs/ukadoc-ssp/functions/archiveviewer.md) ([公式版](https://ukatech.shillest.net/ukadoc-ssp/functions/archiveviewer/))
- **対応状況**: ⚠️ 一部対応

## 突合結果

docs/ukadoc-ssp/functions/archiveviewer.md の「圧縮時のパスワード設定」に関する仕様項目。 VFS 内部ファイル（nar/zip）のプレビューツール（計画中）

## 実装箇所

- `ui/ts/core/actions/menu-action-system.ts:29` `if (action === "pictureviewer" || action === "archiveviewer") {`
- `ui/ts/ui/submenu-renderer.ts:184` `{ action: "archiveviewer", label: "アーカイブビューワ", shortcut: "" },`
