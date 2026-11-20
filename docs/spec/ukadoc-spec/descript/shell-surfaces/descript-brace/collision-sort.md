# collision-sort,種別

- **規格**: [collision-sort.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell-surfaces/descript-brace/collision-sort/) (ukadoc-spec/descript/shell-surfaces/descript-brace/collision-sort.md)
- **検索語**: collision-sort
- **対応状況**: ✅ 実装済

## 突合結果

`ui/js/surface/surface-load.js` の `loadSurfacesTxt` において `surfaces.txt` ファイル・エイリアス・アニメーション・衝突判定定義をパース・解決する実装が行われている。

## 実装箇所

- `crates/nanai-core/src/surfaces_parser/parser/core.rs:38` `if k_norm == "collision-sort" || k_norm == "collision.sort" {`
- `tests/surface-collision-detection.test.ts:360` `collision-sort,descend`
- `crates/nanai-surface/src/parser/helpers/lines.rs:31` `"collision-sort" | "collision.sort" => txt.collision_sort = Some(SortKind::parse`
