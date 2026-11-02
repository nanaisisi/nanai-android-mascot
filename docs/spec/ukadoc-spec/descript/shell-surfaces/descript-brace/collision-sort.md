# collision-sort,種別

- **規格**: [collision-sort.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell-surfaces/descript-brace/collision-sort/) (ukadoc-spec/descript/shell-surfaces/descript-brace/collision-sort.md)
- **検索語**: collision-sort
- **対応状況**: ✅ 実装済

## 突合結果

`ui/js/surface/surface-load.js` の `loadSurfacesTxt` において `surfaces.txt` ファイル・エイリアス・アニメーション・衝突判定定義をパース・解決する実装が行われている。

## 実装箇所

- `crates/ui/src/surfaces/types/surface.rs:95` `/// ソート順（collision-sort: ascend / descend / none / id 等）を考慮してヒットテストを行う`
