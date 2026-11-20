# 補足

- **規格**: [note-1.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell/descript-txt/note-1/) (ukadoc-spec/descript/shell/descript-txt/note-1.md)
- **検索語**: 補足
- **対応状況**: ✅ 実装済

## 突合結果

`ui/ts/core/actions/balloon-descript/layout/alignment.ts`（サーフェス/バルーン位置）, `ui/ts/ui/renderers/menu-theme-renderer.ts`（メニュー画像アライメント・タイリング）, および `crates/nanai-core/src/descript_parser/types.rs`（アイコン枠色 RGB）において補足規定の全項目が完全実装済み。

## 実装箇所

- `ui/ts/core/actions/balloon-descript/layout/alignment.ts` (`alignmenttodesktop`, `balloon.alignment`)
- `ui/ts/ui/renderers/menu-theme-renderer.ts` (`menu.background.alignment`, `repeat-x`, `repeat-y`)
- `crates/nanai-core/src/descript_parser/types.rs` (`sakura_icon_frame_color_rgb`, `kero_icon_frame_color_rgb`)
