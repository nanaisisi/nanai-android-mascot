# \i[ID,wait]

- **規格**: [i-ID-wait.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/surface/i-ID-wait/) (ukadoc-spec/list/sakura-script/surface/i-ID-wait.md)
- **検索語**: Animation
- **対応状況**: ✅ 実装済

## 突合結果

\\i[ID] / \\![anim,...] アニメーション制御タグのパース処理を実装 (crates/ui/src/script/command.rs -> SakuraCommand::Animation)。

## 実装箇所

- `crates/nanai-core/src/sakura_player.rs:120` `SakuraToken::Animation(anim_id) => StepOutput::AnimationTrigger {`
- `ui/ts/core/wasm/wasm-types.ts:12` `| "Animation"`
- `tests/sakura-rust-bridge.test.ts:32` `{ type: "Animation", payload: { id: 1, wait: true } },`
- `crates/nanai-core/src/sakura_script.rs:20` `Animation(i32),`
- `ui/ts/core/wasm/pkg/nanai_core.d.ts:76` `export type SakuraToken = { type: "Text"; value: string } | { type: "Scope"; val`
- `tests/app-update/mock/dom/element/element-methods/misc.ts:65` `): Animation => {`
