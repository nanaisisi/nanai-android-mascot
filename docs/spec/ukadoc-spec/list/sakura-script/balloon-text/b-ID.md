# \b[ID番号]

- **規格**: [b-ID.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/balloon-text/b-ID/) (ukadoc-spec/list/sakura-script/balloon-text/b-ID.md)
- **検索語**: \b
- **対応状況**: ⚠️ 一部対応

## 突合結果

`\b[n]`, `\b[-1]`, `\b0`～`\b9` などのバルーン切り替え・非表示制御コマンドのパースおよび `Balloon(i32)` コマンド処理を完備 (`crates/ui/src/script/parser/mod.rs`, `src-tauri/src/commands/window/balloon_window/show.rs`)。

## 実装箇所

- `src-tauri/src/commands/window/balloon_window/show.rs:168` `/// 独立バルーン（スコープ N）ウィンドウ非表示コマンド (\b[-1])`
- `src-tauri/src/common/vfs.rs:26` `let norm = normalize_vfs_path("foo\\bar//baz/../qux");`
- `crates/nanai-core/src/sakura_player.rs:16` `/// バルーンの切り替え (\b[0])`
- `crates/nanai-core/src/sakura_script.rs:17` `/// バルーン指定 (\b[N])`
- `crates/nanai-core/src/sakura_script.rs:264` `let script = "\\q[選択肢,id1]\\_a[anchor_id]リンク文字\\_a\\b[0]\\i[10]";`
