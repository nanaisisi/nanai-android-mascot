# オーナードローメニュー項目表示

- **規格**: [ownerdraw-item-display.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-resource/ownerdraw-item-display/)
- **検索語**: オーナードローメニュー
- **対応状況**: ✅ 対応済

## 突合結果

`src-tauri/src/ghost/scan/shell.rs` および `ui/js/ui/submenu.js` にてシェルのオーナードローメニュー項目の表示・非表示、配色、ビットマップ背景の動的適用に対応。

## 実装箇所

- `ui/css/balloon-theme.css:3` `SSP / ukadoc オーナードローメニュー互換トークン`
- `ui/css/context-menu.css:3` `(バルーンデザインシステム連動オーナードローメニュー)`
- `ui/js/surface/bind-menu.js:7` `* オーナードローメニュー表示用のカテゴリ階層へ変換する。`
