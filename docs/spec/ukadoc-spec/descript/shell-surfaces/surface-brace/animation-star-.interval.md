# animation\*.interval,インターバル

- **規格**: [animation-star-.interval.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell-surfaces/surface-brace/animation-star-.interval/) (ukadoc-spec/descript/shell-surfaces/surface-brace/animation-star-.interval.md)
- **検索語**: animation
- **対応状況**: ⚠️ 一部対応

## 突合結果

surface-parser.js が解析し、判定・再生に利用している。

## 実装箇所

- `src-tauri/src/commands/shell/mod.rs:7` `pub mod animation;`
- `src-tauri/src/commands/shell/mod.rs:13` `pub use animation::*;`
- `crates/ui/src/lib.rs:1` `pub mod animation;`
- `crates/ui/src/lib.rs:22` `pub use animation::{`
- `crates/ui/src/animation/tests/active_animation.rs:6` `use crate::animation::scheduler::ActiveAnimation;`
