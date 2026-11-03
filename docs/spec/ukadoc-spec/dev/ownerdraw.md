# dev/ownerdraw.md 規格対応文書

- **参照規格**: [ukadoc-spec/dev/ownerdraw.md](../../../../ukadoc-spec/dev/ownerdraw.md) (オーナードローメニュー)
- **対応状況**: ✅ 実装済

## 突合結果

- シェルのオーナードローメニュー、背景・サイドバービットマップ、およびカスタムテーマ適用の実装完了。

## 実装箇所

- `ui/js/ui/renderers/menu-caption-renderer.js:3` `* @brief UKADOC ownerdraw-item-name 準拠のメニュー項目キャプション動的解決・反映モジュール`
- `ui/js/ui/renderers/menu-renderer.js:116` `* メニュー項目キャプションを動的に更新 (UKADOC ownerdraw-item-name 準拠)`
