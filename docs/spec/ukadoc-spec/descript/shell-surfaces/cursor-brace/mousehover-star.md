# mousehover\*,当たり判定ID,ファイル名

- **規格**: [mousehover-star.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell-surfaces/cursor-brace/mousehover-star/) (ukadoc-spec/descript/shell-surfaces/cursor-brace/mousehover-star.md)
- **検索語**: mousehover
- **対応状況**: ✅ 実装済

## 突合結果

ui/js/surface/surface-load.js の loadSurfacesTxt において surfaces.txt ファイル・エイリアス・アニメーション・衝突判定定義をパース・解決する実装が行われている。

## 実装箇所

- `crates/ui/src/surfaces/parser/helpers/lines.rs:94` `} else if raw_event.starts_with("mousehover") {`
- `crates/ui/src/surfaces/parser/helpers/lines.rs:95` `"mousehover"`
- `crates/ui/src/surfaces/tests/parser_tests/parser_edge_cases.rs:88` `mousehover,Head,sys3`
- `crates/ui/src/surfaces/tests/parser_tests/syntax_blocks/points_ui.rs:94` `txt.get_cursor("sakura", "mousehover", "Face"),`
- `ui/ts/surface/parser/scope-blocks.ts:70` `else if (rawEvent.startsWith("mousehover")) event = "mousehover";`
