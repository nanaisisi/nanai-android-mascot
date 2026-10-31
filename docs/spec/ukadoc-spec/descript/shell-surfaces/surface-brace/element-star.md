# element\*,描画メソッド,ファイル名,X座標,Y座標(,オプション...)

- **規格**: [element-star.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell-surfaces/surface-brace/element-star/) (ukadoc-spec/descript/shell-surfaces/surface-brace/element-star.md)
- **検索語**: element
- **対応状況**: ⚠️ 一部対応 (Rust パーサー `crates/ui/src/surfaces.rs` で解析・データ化実装済 / 描画・実行への反映は別レイヤー)

## 突合結果

surface-parser.js が解析 (パターン種別など) するが、描画への反映は個別未確認。

## 実装箇所

- `src-tauri/src/commands/shell/manifest.rs:68` `kind: "element",`
- `src-tauri/src/commands/shell/manifest.rs:90` `"element".hash(&mut hasher);`
- `crates/ui/src/manifest.rs:5` `//! element 合成・SERIKO 再生・当たり判定・着せ替え描画を行う。`
- `crates/ui/src/manifest.rs:22` `/// element / animation / collision / point 定義`
- `crates/ui/src/manifest.rs:102` `"charset,Shift_JIS\nsurface0\n{\nelement0,base,surface0.png,0,0\ncollisionex0,he`
