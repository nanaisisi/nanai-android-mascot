# surfaces.txt

- **規格**: [introduction_surfaces.txt.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell-surfaces/introduction_surfaces.txt/) (ukadoc-spec/descript/shell-surfaces/introduction_surfaces.txt.md)
- **検索語**: surfaces.txt
- **対応状況**: ⚠️ 一部対応 (Rust パーサー `crates/ui/src/surfaces.rs` で解析・データ化実装済 / 描画・実行への反映は別レイヤー)

## 突合結果

surface-parser.js / surface-animation-manager.js に該当の解析・処理は確認できない。

## 実装箇所

- `crates/ui/src/surfaces.rs` （Rust 版 surfaces.txt パーサー：Element / Collision / SERIKO / Alias / append の解析）

- `ui/js/surface/surface-parser.js:2` (コメント) `* surfaces.txt パーサーモジュール`
- `ui/js/surface/surface-parser.js:58` (コメント) `* surfaces.txt をパースして collisions, elements, animations を抽出`
- `ui/js/surface/surface.js:17` (コメント) `* Nanai Android Mascot - surfaces.txt パーサー & 当たり判定（Collision）マネージャー`
- `ui/js/surface/surface.js:52` (コメント) `* ゴーストの surfaces.txt を読み込んでパース`
- `ui/js/surface/surface.js:62` `const surfacesPath = ${basePath}/surfaces.txt;`
