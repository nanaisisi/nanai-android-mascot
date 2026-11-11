# mousedown\*,当たり判定ID,ファイル名

- **規格**: [mousedown-star.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell-surfaces/cursor-brace/mousedown-star/) (ukadoc-spec/descript/shell-surfaces/cursor-brace/mousedown-star.md)
- **検索語**: mousedown
- **対応状況**: ⚠️ 一部対応

## 突合結果

ui/js/surface/surface-load.js の loadSurfacesTxt において surfaces.txt ファイル・エイリアス・アニメーション・衝突判定定義をパース・解決する実装が行われている。

## 実装箇所

- `crates/ui/src/surfaces/parser/helpers/lines.rs:88` `} else if raw_event.starts_with("mousedown") {`
- `crates/ui/src/surfaces/parser/helpers/lines.rs:89` `"mousedown"`
- `crates/ui/src/surfaces/tests/parser_tests/syntax_blocks/points_ui.rs:86` `txt.get_cursor("sakura", "mousedown", "Head"),`
- `crates/ui/src/surfaces/tests/parser_tests/syntax_blocks/points_ui.rs:90` `txt.get_cursor("sakura", "mousedown", "Bust"),`
- `crates/ui/src/surfaces/tests/parser_tests/syntax_blocks/points_ui.rs:98` `txt.get_cursor("1", "mousedown", "Tail"),`
