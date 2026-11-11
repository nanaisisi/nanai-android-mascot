# tooltip

- **規格**: [tooltip.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-resource/tooltip/tooltip/) (ukadoc-spec/list/shiori-resource/tooltip/tooltip.md)
- **検索語**: tooltip
- **対応状況**: ⚠️ 一部対応

## 突合結果

デスクトップウィンドウ設定やサーフィスロード関連コード内においてツールチップ（tooltip）定義を実装・サポート (`ui/windows/tauri-desktop.conf.json`, `ui/js/surface/surface-load.js`)。

## 実装箇所

- `src-tauri/src/tray.rs:33` `.tooltip("Nanai Android Mascot")`
- `src-tauri/src/shiori/property/evaluator/static_rules.rs:32` `"balloon_tooltip" | "tooltip" => "",`
- `crates/ui/src/surfaces/tests/parser_tests/syntax_blocks/surface_alias.rs:85` `Head,Head tooltip`
- `crates/ui/src/surfaces/tests/parser_tests/syntax_blocks/surface_alias.rs:90` `assert_eq!(parsed_char.tooltips["char2"]["Head"], "Head tooltip");`
- `ui/ts/surface/surface-collision.ts:257` `const tooltip = lowerMap.get(colLower);`
