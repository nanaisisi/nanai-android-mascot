# \*

- **規格**: [star.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/choice/star/) (ukadoc-spec/list/sakura-script/choice/star.md)
- **検索語**: \*
- **対応状況**: ✅ 実装済

## 突合結果

`\*` (Star) タグによる選択肢入力待ち制御（スクリプト進行の一時停止および選択肢クリック時の進行再開）をコアエンジン・演奏器にて完全実装。

## 実装箇所

- `crates/nanai-core/src/sakura_script/types.rs` `SakuraToken::Star`
- `crates/nanai-core/src/sakura_player.rs` `StepOutput::ChoiceWait { scope }`
- `crates/ui/src/script/command.rs:43` `Star,         // \*`
- `ui/ts/ghost/sakura-script.ts` `case "ChoiceWait": ...`
