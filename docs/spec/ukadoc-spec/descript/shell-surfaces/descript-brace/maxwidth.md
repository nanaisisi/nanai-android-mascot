# maxwidth,ピクセル

- **規格**: [maxwidth.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell-surfaces/descript-brace/maxwidth/) (ukadoc-spec/descript/shell-surfaces/descript-brace/maxwidth.md)
- **検索語**: maxwidth
- **対応状況**: ⚠️ 一部対応

## 突合結果

`ui/js/surface/surface-load.js` の `loadSurfacesTxt` において `surfaces.txt` ファイル・エイリアス・アニメーション・衝突判定定義をパース・解決する実装が行われている。

## 実装箇所

- `crates/ui/src/surfaces/parser/tests.rs:22` `assert_eq!(parsed.maxwidth, Some(300));`
- `crates/ui/src/surfaces/parser/helpers/lines.rs:29` `"maxwidth" => txt.maxwidth = value.trim().parse().ok(),`
- `crates/ui/src/surfaces/tests/collision_tests.rs:132` `maxwidth,600`
- `crates/ui/src/surfaces/tests/parser_tests/parser_edge_cases.rs:72` `maxwidth,invalid_maxwidth`
- `crates/ui/src/surfaces/types/txt/surfaces_txt/core/definition.rs:17` `pub maxwidth: Option<i32>,`
