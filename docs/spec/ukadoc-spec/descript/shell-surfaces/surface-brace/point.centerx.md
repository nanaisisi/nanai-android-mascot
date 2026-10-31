# point.centerx,座標

- **規格**: [point.centerx.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell-surfaces/surface-brace/point.centerx/) (ukadoc-spec/descript/shell-surfaces/surface-brace/point.centerx.md)
- **検索語**: point.centerx
- **対応状況**: ⚠️ 一部対応 (Rust パーサー `crates/ui/src/surfaces.rs` で解析・データ化実装済 / 描画・実行への反映は別レイヤー)

## 突合結果

実装コードに「point.centerx」が見つからない。

## 実装箇所

- `crates/ui/src/surfaces/parser/mod.rs:243` `surface0 {\r\nname,SurfaceZero\r\ncollision0,0,0,10,10,Head\r\ncollisionex0,Face`
- `crates/ui/src/surfaces/tests/parser_tests.rs:31` `point.centerx,96`
