# collision-sort,種別

- **規格**: [collision-sort.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell-surfaces/descript-brace/collision-sort/) (ukadoc-spec/descript/shell-surfaces/descript-brace/collision-sort.md)
- **検索語**: collision-sort
- **対応状況**: ⚠️ 一部対応

## 突合結果

`ui/js/surface/surface-load.js` の `loadSurfacesTxt` において `surfaces.txt` ファイル・エイリアス・アニメーション・衝突判定定義をパース・解決する実装が行われている。

## 実装箇所

- `crates/ui/src/surfaces/parser/helpers/lines.rs:31` `"collision-sort" | "collision.sort" => txt.collision_sort = Some(SortKind::parse`
- `crates/ui/src/surfaces/tests/collision_tests.rs:213` `collision-sort,descend`
- `crates/ui/src/surfaces/tests/parser_tests/parser_edge_cases.rs:74` `collision-sort,id`
