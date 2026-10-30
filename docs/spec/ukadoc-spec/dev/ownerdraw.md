# dev/ownerdraw.md 規格対応文書

- **参照規格**: [ukadoc-spec/dev/ownerdraw.md](../../../../ukadoc-spec/dev/ownerdraw.md) (オーナードローメニュー)
- **対応状況**: ✅ 対応済

## 突合結果
- シェルのオーナードローメニュー、背景・サイドバービットマップ、およびカスタムテーマ適用の実装完了。

## 実装箇所
- `src-tauri/src/ghost/scan/shell.rs` メニュー設定パース
- `ui/js/ui/submenu.js` メニュー項目レンダリング
