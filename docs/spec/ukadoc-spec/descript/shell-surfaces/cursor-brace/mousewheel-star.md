# mousewheel\*,当たり判定ID,ファイル名

- **規格**: [mousewheel-star.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell-surfaces/cursor-brace/mousewheel-star/) (ukadoc-spec/descript/shell-surfaces/cursor-brace/mousewheel-star.md)
- **検索語**: mousewheel
- **対応状況**: ⚠️ 一部対応

## 突合結果

ui/js/surface/surface-load.js の loadSurfacesTxt において surfaces.txt ファイル・エイリアス・アニメーション・衝突判定定義をパース・解決する実装が行われている。

## 実装箇所

- `crates/ui/src/surfaces/parser/helpers/lines.rs:92` `} else if raw_event.starts_with("mousewheel") {`
- `crates/ui/src/surfaces/parser/helpers/lines.rs:93` `"mousewheel"`
- `crates/ui/src/surfaces/tests/parser_tests/parser_edge_cases.rs:87` `mousewheel,Head,sys2`
- `ui/ts/surface/parser/scope-blocks.ts:69` `else if (rawEvent.startsWith("mousewheel")) event = "mousewheel";`
