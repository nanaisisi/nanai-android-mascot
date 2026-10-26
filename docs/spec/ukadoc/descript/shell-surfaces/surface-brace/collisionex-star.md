# collisionex\*,ID,タイプ,座標1,座標2...

- **規格**: [collisionex-star.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell-surfaces/surface-brace/collisionex-star/) (ukadoc-spec/descript/shell-surfaces/surface-brace/collisionex-star.md)
- **検索語**: collisionex
- **対応状況**: ⚠️ 一部対応 (Rust パーサー `crates/ui/src/surfaces.rs` で解析・データ化実装済 / 描画・実行への反映は別レイヤー)

## 突合結果

surface-parser.js が解析し、判定・再生に利用している。

## 実装箇所

- `crates/ui/src/surfaces.rs` （Rust 版 surfaces.txt パーサー：Element / Collision / SERIKO / Alias / append の解析）

- `ui/js/surface/surface-parser.js:84` (コメント) `// collisionex[ID],[name],[shape],[coords...] または collision[ID],[coords...],[name]`
- `ui/js/surface/surface-parser.js:85` `if (trimmed.startsWith("collisionex")) {`
