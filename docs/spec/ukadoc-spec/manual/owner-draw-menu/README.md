# オーナードローメニュー仕様の項目別突合

- **規格**: [ukadoc-spec/manual/owner-draw-menu.md](https://github.com/ukatech/ukadoc-spec/blob/main/manual/owner-draw-menu.md)
- **判定基準**: このリポジトリで確認できるメニューの背景・サイドバービットマップ描画、カラーカスタマイズ、フォント設定

| 項目                                     | 対応状況 |
| ---------------------------------------- | -------- |
| [メニュー背景・サイドバービットマップ](menu-bitmaps.md) | ✅ 実装済  |
| [メニュー配色・セパレータ設定](menu-colors.md)      | ✅ 実装済  |
| [メニューフォント設定](menu-fonts.md)          | ✅ 実装済  |

## 対応範囲の共通事項

- シェルの `descript.txt` に定義されたメニュー配色、フォントサイズ、背景・前景・サイドバー画像（Data URL base64 変換）をサブメニュー UI (`ui/js/ui/submenu.js`) に動的適用。
