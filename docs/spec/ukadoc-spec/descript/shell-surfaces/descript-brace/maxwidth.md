# maxwidth,ピクセル

- **規格**: [maxwidth.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell-surfaces/descript-brace/maxwidth/) (ukadoc-spec/descript/shell-surfaces/descript-brace/maxwidth.md)
- **検索語**: maxwidth
- **対応状況**: ✅ 対応済 (surface-load.js)

## 突合結果

`ui/js/surface/surface-load.js` の `loadSurfacesTxt` において `surfaces.txt` ファイル・エイリアス・アニメーション・衝突判定定義をパース・解決する実装が行われている。

## 実装箇所

- `crates/ui/src/surfaces/parser/mod.rs:149` `"maxwidth" => txt.maxwidth = value.trim().parse().ok(),`
- `crates/ui/src/surfaces/parser/mod.rs:233` `descript {\r\nversion,1\r\nmaxwidth,300\r\nanimation.sort,ascend\r\ncollision.so`
- `crates/ui/src/surfaces/parser/mod.rs:247` `assert_eq!(parsed.maxwidth, Some(300));`
- `crates/ui/src/surfaces/types/txt.rs:16` `/// `descript`ブロック内の`maxwidth,``
- `crates/ui/src/surfaces/types/txt.rs:17` `pub maxwidth: Option<i32>,`
