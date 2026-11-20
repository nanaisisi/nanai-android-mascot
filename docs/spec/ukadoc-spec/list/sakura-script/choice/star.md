# \*

- **規格**: [star.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/choice/star/) (ukadoc-spec/list/sakura-script/choice/star.md)
- **検索語**: \*
- **対応状況**: ⚠️ 一部対応

## 突合結果

`\*` (Star) タグによる選択肢入力待ち制御（スクリプト進行の一時停止および選択肢クリック時の進行再開）をコアエンジン・演奏器にて完全実装。

## 実装箇所

- `crates/nanai-core/src/sakura_player.rs:26` `/// 選択肢入力待ち (\*)`
- `ui/ts/ui/renderers/modal-dialog-system.ts:190` `const clean = p.trim().replace(/^\*/, "");`
- `crates/nanai-core/src/sakura_script/types.rs:197` `/// 選択肢入力待ち (\*)`
- `crates/ui/src/script/command.rs:43` `Star,         // \*`
- `crates/ui/src/script/env.rs:203` `// %* (%\*) 環境変数展開 [pct-star.md]`
- `crates/ui/src/script/parser/executor.rs:115` `Some('*') => callback(SakuraCommand::Star), // \*`
