# mouserightdown\*,当たり判定ID,ファイル名

- **規格**: [mouserightdown-star.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell-surfaces/cursor-brace/mouserightdown-star/) (ukadoc-spec/descript/shell-surfaces/cursor-brace/mouserightdown-star.md)
- **検索語**: mouserightdown
- **対応状況**: ⚠️ 一部対応

## 突合結果

ui/js/surface/surface-load.js の loadSurfacesTxt において surfaces.txt ファイル・エイリアス・アニメーション・衝突判定定義をパース・解決する実装が行われている。

## 実装箇所

- `crates/ui/src/surfaces/parser/helpers/lines.rs:90` `} else if raw_event.starts_with("mouserightdown") {`
- `crates/ui/src/surfaces/parser/helpers/lines.rs:91` `"mouserightdown"`
- `crates/ui/src/surfaces/tests/parser_tests/parser_edge_cases.rs:86` `mouserightdown,Head,sys1`
- `ui/ts/surface/parser/scope-blocks.ts:68` `else if (rawEvent.startsWith("mouserightdown")) event = "mouserightdown";`
