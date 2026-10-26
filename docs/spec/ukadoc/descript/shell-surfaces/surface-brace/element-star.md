# element\*,描画メソッド,ファイル名,X座標,Y座標(,オプション...)

- **規格**: [element-star.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell-surfaces/surface-brace/element-star/) (ukadoc-spec/descript/shell-surfaces/surface-brace/element-star.md)
- **検索語**: element
- **対応状況**: ⚠️ 一部対応 (Rust パーサー `crates/ui/src/surfaces.rs` で解析・データ化実装済 / 描画・実行への反映は別レイヤー)

## 突合結果

surface-parser.js が解析 (パターン種別など) するが、描画への反映は個別未確認。

## 実装箇所
- `crates/ui/src/surfaces.rs` （Rust 版 surfaces.txt パーサー：Element / Collision / SERIKO / Alias / append の解析）

- `ui/js/surface/surface-parser.js:58` (コメント) `* surfaces.txt をパースして collisions, elements, animations を抽出`
- `ui/js/surface/surface-parser.js:60` (コメント) `* @returns {{ collisions: Record<string, CollisionArea[]>, elements: Record<string, Surfac`
- `ui/js/surface/surface-parser.js:64`  `const elements = {};`
- `ui/js/surface/surface-parser.js:115`  `} else if (trimmed.startsWith("element")) {`
- `ui/js/surface/surface-parser.js:124`  `if (!elements[s]) elements[s] = [];`
