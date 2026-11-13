# \bID番号

- **規格**: [bID.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/balloon-text/bID/) (ukadoc-spec/list/sakura-script/balloon-text/bID.md)
- **検索語**: \b
- **対応状況**: ✅ 実装済

## 突合結果

`\b0`～`\b9` などの数字直結型バルーン切替コマンドのパース処理および `SakuraCommand::Balloon(n)` へのマッピングを実装 (`crates/ui/src/script/parser/mod.rs`, `basic.rs`)。


## 実装箇所

- `crates/nanai-core/src/sakura_player.rs:16` `/// バルーンの切り替え (\b[0])`
- `src-tauri/src/commands/window/balloon_window/show.rs:168` `/// 独立バルーン（スコープ N）ウィンドウ非表示コマンド (\b[-1])`
- `ui/ts/ghost/parser/tag/display.ts:3` `* @brief 座標移動・同期表示・バルーンタグのトークナイズ処理 (\_l, \_s, \b)`
- `ui/ts/ui/spec-compliance-runner.ts:472` `const specName = "\\p[2] / \\s[20] / \\b[0] タグトークナイズ";`
- `tests/tag-tokenizer.test.ts:160` `assert.equal(tokenizeTextFormatTag("\\b", 1, 2), null);`
- `crates/nanai-core/src/sakura_script.rs:17` `/// バルーン指定 (\b[N])`
