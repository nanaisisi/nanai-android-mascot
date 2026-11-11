# mouseup\*,当たり判定ID,ファイル名

- **規格**: [mouseup-star.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell-surfaces/cursor-brace/mouseup-star/) (ukadoc-spec/descript/shell-surfaces/cursor-brace/mouseup-star.md)
- **検索語**: mouseup
- **対応状況**: ⚠️ 一部対応

## 突合結果

ui/js/surface/surface-load.js の loadSurfacesTxt において surfaces.txt ファイル・エイリアス・アニメーション・衝突判定定義をパース・解決する実装が行われている。

## 実装箇所

- `crates/ui/src/surfaces/parser/helpers/lines.rs:86` `let event = if raw_event.starts_with("mouseup") {`
- `crates/ui/src/surfaces/parser/helpers/lines.rs:87` `"mouseup"`
- `crates/ui/src/surfaces/tests/parser_tests/syntax_blocks/points_ui.rs:84` `assert_eq!(txt.get_cursor("0", "mouseup", "Head"), Some("system:hand"));`
- `crates/ui/src/tests/surfaces.rs:31` `mouseup,Head,system:hand`
- `crates/ui/src/tests/surfaces.rs:42` `txt.get_cursor("sakura", "mouseup", "Head"),`
