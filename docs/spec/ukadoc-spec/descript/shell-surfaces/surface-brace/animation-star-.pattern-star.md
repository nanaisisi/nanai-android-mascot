# animation\*.pattern\*,描画メソッド,サーフェス番号,ウェイト,X座標,Y座標(,オプション...)

- **規格**: [animation-star-.pattern-star.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell-surfaces/surface-brace/animation-star-.pattern-star/) (ukadoc-spec/descript/shell-surfaces/surface-brace/animation-star-.pattern-star.md)
- **検索語**: animation
- **対応状況**: ⚠️ 一部対応 (Rust パーサー `crates/ui/src/surfaces.rs` で解析・データ化実装済 / 描画・実行への反映は別レイヤー)

## 突合結果

surface-parser.js が解析 (パターン種別など) するが、描画への反映は個別未確認。

## 実装箇所

- `src-tauri/src/lib.rs:98` `commands::shell::animation_timeline,`
- `src-tauri/src/commands/shell/mod.rs:7` `pub mod animation;`
- `src-tauri/src/commands/shell/mod.rs:12` `pub use animation::*;`
- `src-tauri/src/commands/shell/animation.rs:49` `pub fn animation_timeline(patterns: Vec<TimelinePattern>) -> Result<AnimationTim`
- `crates/ui/src/manifest.rs:22` `/// element / animation / collision / point 定義`
