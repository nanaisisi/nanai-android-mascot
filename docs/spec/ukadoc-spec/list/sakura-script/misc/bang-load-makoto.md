# \![load,makoto]

- **規格**: [bang-load-makoto.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/misc/bang-load-makoto/) (ukadoc-spec/list/sakura-script/misc/bang-load-makoto.md)
- **検索語**: Command
- **対応状況**: ✅ 実装済

## 突合結果

`\![load,makoto]` (MAKOTOモジュールロード) コマンドのパース処理を実装 (`crates/ui/src/script/parser/brackets/handlers/raiselike.rs` -> `SakuraCommand::Command`)。

## 実装箇所

- `crates/ui/src/script/command.rs:169` `Command {`
- `src-tauri/build.rs:25` `let status = std::process::Command::new(std::env::var("CARGO").unwrap_or("cargo"`
- `ui/ts/core/actions/sstp-fmo-actions.ts:232` `lines.push(`Command: ${payload.command}`);`
- `tests/command-handler-boost.test.ts:18` `describe("Command Handler Plugins & Desktop Coverage", () => {`
- `crates/ui/src/script/ast/builder.rs:26` `children: vec![SakuraAstNode::Command(SakuraCommand::Text(text.clone()))],`
- `src-tauri/build.rs:69` `let sysroot_output = std::process::Command::new("xcrun")`
