# 対応する画像形式

- **規格**: [pictureviewer.md](../../../../../docs/ukadoc-ssp/functions/pictureviewer.md) ([公式版](https://ukatech.shillest.net/ukadoc-ssp/functions/pictureviewer/))
- **対応状況**: ⚠️ 一部対応

## 突合結果

docs/ukadoc-ssp/functions/pictureviewer.md の「対応する画像形式」に関する仕様項目。 サーフィスおよび画像アセットのプレビュー・ビューワモーダル機能の実装完了。

## 実装箇所

- `ui/ts/core/actions/menu-action-system.ts:29` `if (action === "pictureviewer" || action === "archiveviewer") {`
- `ui/ts/ui/submenu-renderer.ts:183` `{ action: "pictureviewer", label: "画像ビューワ", shortcut: "" },`
