# \![anim,clear,ID]

- **規格**: [bang-anim-clear-ID.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/surface/bang-anim-clear-ID/) (ukadoc-spec/list/sakura-script/surface/bang-anim-clear-ID.md)
- **検索語**: Animation
- **対応状況**: ✅ 実装済

## 突合結果

\\i[ID] / \\![anim,...] アニメーション制御タグのパース処理を実装 (crates/ui/src/script/command.rs -> SakuraCommand::Animation)。

## 実装箇所

- `src-tauri/src/commands/shell/animation.rs:39` `pub struct AnimationTimeline {`
- `src-tauri/src/commands/shell/animation.rs:45` `pub fn animation_timeline(patterns: Vec<TimelinePattern>) -> Result<AnimationTim`
- `src-tauri/src/commands/shell/animation.rs:47` `use nanai_android_mascot_ui::surfaces::{AnimationPattern, DrawMethod};`
- `src-tauri/src/commands/shell/animation.rs:49` `let anims: Vec<AnimationPattern> = patterns`
- `src-tauri/src/commands/shell/animation.rs:51` `.map(|p| AnimationPattern {`
