# animation\*.option,shared-index

- **規格**: [animation-star-.option-3.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell-surfaces/surface-brace/animation-star-.option-3/) (ukadoc-spec/descript/shell-surfaces/surface-brace/animation-star-.option-3.md)
- **検索語**: animation
- **対応状況**: ⚠️ 一部対応 (Rust パーサー `crates/ui/src/surfaces.rs` で解析・データ化実装済 / 描画・実行への反映は別レイヤー)

## 突合結果

surface-parser.js / surface-animation-manager.js に該当の解析・処理は確認できない。

## 実装箇所

- `src-tauri/src/lib.rs:100` `commands::shell::animation_timeline,`
- `src-tauri/src/commands/shell/animation.rs:45` `pub fn animation_timeline(patterns: Vec<TimelinePattern>) -> Result<AnimationTim`
- `src-tauri/src/commands/shell/mod.rs:7` `pub mod animation;`
- `src-tauri/src/commands/shell/mod.rs:12` `pub use animation::*;`
- `crates/ui/src/lib.rs:1` `pub mod animation;`
