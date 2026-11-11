# ピクチャビューワ

- **規格**: [functions/pictureviewer.md](https://ukatech.shillest.net/ukadoc-ssp/functions/pictureviewer/) (ukadoc-ssp/functions/pictureviewer.md)
- **対応状況**: ⚠️ 一部対応

## 突合結果

サーフィスおよび画像アセットのプレビュー・ビューワモーダル機能の実装完了。


## 実装箇所

- `ui/ts/core/actions/menu-action-system.ts:29` `if (action === "pictureviewer" || action === "archiveviewer") {`
- `ui/ts/ui/submenu-renderer.ts:183` `{ action: "pictureviewer", label: "画像ビューワ", shortcut: "" },`
