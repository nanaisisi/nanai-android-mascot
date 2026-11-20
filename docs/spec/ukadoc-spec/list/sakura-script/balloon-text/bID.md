# \bID番号

- **規格**: [bID.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/balloon-text/bID/) (ukadoc-spec/list/sakura-script/balloon-text/bID.md)
- **検索語**: \b
- **対応状況**: ⚠️ 一部対応

## 突合結果

`\b0`～`\b9` などの数字直結型バルーン切替コマンドのパース処理および `SakuraCommand::Balloon(n)` へのマッピングを実装 (`crates/ui/src/script/parser/mod.rs`, `basic.rs`)。


## 実装箇所

- `crates/nanai-core/src/sakura_player.rs:16` `/// バルーンの切り替え (\b[0])`
- `src-tauri/src/commands/window/balloon_window/show.rs:762` `/// 独立バルーン（スコープ N）ウィンドウ非表示コマンド (\b[-1])`
- `ui/ts/ghost/balloon-window.ts:154` `if (/<(?:button|a|img|input|textarea|select)\b/i.test(raw)) {`
- `ui/ts/ui/compliance/balloon-probes.ts:163` `const specName = "\\p[2] / \\s[20] / \\b[0] タグトークナイズ";`
- `crates/nanai-core/src/sakura_script/tests.rs:20` `let script = "\\q[選択肢,id1]\\_a[anchor_id]リンク文字\\_a\\b[0]\\i[10]";`
- `src-tauri/src/common/vfs.rs:26` `let norm = normalize_vfs_path("foo\\bar//baz/../qux");`
