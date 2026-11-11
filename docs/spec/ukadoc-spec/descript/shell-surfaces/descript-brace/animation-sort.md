# animation-sort,ソート順序

- **規格**: [animation-sort.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell-surfaces/descript-brace/animation-sort/) (ukadoc-spec/descript/shell-surfaces/descript-brace/animation-sort.md)
- **検索語**: animation-sort
- **対応状況**: ⚠️ 一部対応

## 突合結果

`ui/js/surface/surface-load.js` の `loadSurfacesTxt` において `surfaces.txt` ファイル・エイリアス・アニメーション・衝突判定定義をパース・解決する実装が行われている。

## 実装箇所

- `crates/ui/src/surfaces/parser/helpers/lines.rs:30` `"animation-sort" | "animation.sort" => txt.animation_sort = Some(SortKind::parse`
- `crates/ui/src/surfaces/tests/collision_tests.rs:214` `animation-sort,ascend`
- `crates/ui/src/surfaces/tests/parser_tests/parser_edge_cases.rs:73` `animation-sort,id`
