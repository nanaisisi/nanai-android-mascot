# \![anim,add,text,x,y,横幅,縦幅,文字列,表示時間,r,g,b,文字サイズ,文字名]

- **規格**: [bang-anim-add-text-x-y-r-g-b.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/surface/bang-anim-add-text-x-y-r-g-b/) (ukadoc-spec/list/sakura-script/surface/bang-anim-add-text-x-y-r-g-b.md)
- **検索語**: Animation
- **対応状況**: ⚠️ 一部対応

## 突合結果

\\i[ID] / \\![anim,...] アニメーション制御タグのパース処理を実装 (crates/ui/src/script/command.rs -> SakuraCommand::Animation)。

## 実装箇所

- `crates/nanai-core/src/sakura_player.rs:120` `SakuraToken::Animation(anim_id) => StepOutput::AnimationTrigger {`
- `crates/nanai-core/src/sakura_script.rs:20` `Animation(i32),`
- `crates/nanai-core/src/sakura_script.rs:111` `tokens.push(SakuraToken::Animation(id));`
- `crates/nanai-core/src/sakura_script.rs:282` `assert_eq!(tokens[3], SakuraToken::Animation(10));`
- `crates/nanai-core/ui/ts/core/wasm/pkg/nanai_core.d.ts:83` `export type SakuraToken = { type: "Text"; value: string } | { type: "Scope"; val`
