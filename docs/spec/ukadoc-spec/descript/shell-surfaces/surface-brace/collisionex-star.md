# collisionex\*,ID,タイプ,座標1,座標2...

- **規格**: [collisionex-star.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell-surfaces/surface-brace/collisionex-star/) (ukadoc-spec/descript/shell-surfaces/surface-brace/collisionex-star.md)
- **検索語**: collisionex
- **対応状況**: ⚠️ 一部対応 (Rust パーサー `crates/ui/src/surfaces.rs` で解析・データ化実装済 / 描画・実行への反映は別レイヤー)

## 突合結果

surface-parser.js が解析し、判定・再生に利用している。

## 実装箇所

- `crates/ui/src/lib.rs:224` `fn test_collisionex_circle_and_ellipse() {`
- `crates/ui/src/lib.rs:227` `collisionex0,face,circle,100,100,50`
- `crates/ui/src/lib.rs:228` `collisionex1,halo,ellipse,100,100,60,30`
- `crates/ui/src/manifest.rs:102` `"charset,Shift_JIS\nsurface0\n{\nelement0,base,surface0.png,0,0\ncollisionex0,he`
- `crates/ui/src/surfaces/parser/mod.rs:185` `if let Some(rest) = key_lower.strip_prefix("collisionex") {`
