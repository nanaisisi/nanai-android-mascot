# balloon.offsetx,座標

- **規格**: [balloon.offsetx.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell-surfaces/surface-brace/balloon.offsetx/) (ukadoc-spec/descript/shell-surfaces/surface-brace/balloon.offsetx.md)
- **検索語**: balloon.offsetx
- **対応状況**: ⚠️ 一部対応 (Rust パーサー `crates/ui/src/surfaces.rs` で解析・データ化実装済 / 描画・実行への反映は別レイヤー)

## 突合結果

実装コードに「balloon.offsetx」が見つからない。


## 実装箇所

- `src-tauri/src/ghost/scan/shell.rs:98` `// [sakura.balloon.offsetx,座標], [sakura.balloon.offsety,座標], [kero.balloon.offse`
- `crates/ui/src/surfaces/parser/mod.rs:243` `surface0 {\r\nname,SurfaceZero\r\ncollision0,0,0,10,10,Head\r\ncollisionex0,Face`
- `crates/ui/src/surfaces/tests/parser_tests.rs:32` `sakura.balloon.offsetx,-10`
- `crates/ui/src/surfaces/types/surface.rs:63` `/// バルーン位置オフセット（`<char>.balloon.offsetx/y`/`balloon.offsetx/y`）`
