# animation\*.interval,インターバル

- **規格**: [animation-star-.interval.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell-surfaces/surface-brace/animation-star-.interval/) (ukadoc-spec/descript/shell-surfaces/surface-brace/animation-star-.interval.md)
- **検索語**: animation
- **対応状況**: ✅ 実装済

## 突合結果

surface-parser.js が解析し、判定・再生に利用している。

## 実装箇所

- `crates/nanai-core/src/surfaces_parser.rs:91` `} else if k_norm == "animation-sort" || k_norm == "animation.sort" {`
- `src-tauri/src/commands/shell/mod.rs:7` `pub mod animation;`
- `ui/ts/ghost/sakura-rust-bridge.ts:147` `type: "animation",`
- `ui/css/balloon-window.css:260` `animation: clickwait-blink 1s steps(2, start) infinite;`
- `tests/ghost-surface.test.ts:75` `test("animation frames do not re-show the character window", async () => {`
- `crates/nanai-surface/src/parser/handlers/mod.rs:3` `pub mod animation;`
