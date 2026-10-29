# animation\*.interval,インターバル

- **規格**: [animation-star-.interval.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell-surfaces/surface-brace/animation-star-.interval/) (ukadoc-spec/descript/shell-surfaces/surface-brace/animation-star-.interval.md)
- **検索語**: animation
- **対応状況**: ✅ 実装済

## 突合結果

surface-parser.js が解析し、判定・再生に利用している。

## 実装箇所

- `src-tauri/src/lib.rs:98` `commands::shell::animation_timeline,`
- `src-tauri/src/commands/shell/mod.rs:7` `pub mod animation;`
- `src-tauri/src/commands/shell/mod.rs:12` `pub use animation::*;`
- `src-tauri/src/commands/shell/animation.rs:49` `pub fn animation_timeline(patterns: Vec<TimelinePattern>) -> Result<AnimationTim`
- `crates/ui/src/manifest.rs:22` `/// element / animation / collision / point 定義`
