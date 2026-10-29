# maxwidth,ピクセル

- **規格**: [maxwidth.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell-surfaces/descript-brace/maxwidth/) (ukadoc-spec/descript/shell-surfaces/descript-brace/maxwidth.md)
- **検索語**: maxwidth
- **対応状況**: ⚠️ 一部対応 (Rust パーサー `crates/ui/src/surfaces.rs` で解析・データ化実装済 / 描画・実行への反映は別レイヤー)

## 突合結果

実装コードに「maxwidth」が見つからない。


## 実装箇所

- `crates/ui/src/surfaces/parser/mod.rs:149` `"maxwidth" => txt.maxwidth = value.trim().parse().ok(),`
- `crates/ui/src/surfaces/types/txt.rs:16` `/// `descript` ブロック内の `maxwidth,``
- `crates/ui/src/surfaces/types/txt.rs:17` `pub maxwidth: Option<i32>,`
