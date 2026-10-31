# \![create,shortcut]

- **規格**: [bang-create-shortcut.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/misc/bang-create-shortcut/) (ukadoc-spec/list/sakura-script/misc/bang-create-shortcut.md)
- **検索語**: CreateShortcut
- **対応状況**: ✅ 実装済

## 突合結果

`\![create,shortcut]` (ショートカット作成) コマンドのパース処理を実装 (`crates/ui/src/script/parser/brackets/handlers/raiselike.rs` -> `SakuraCommand::CreateShortcut`)。

## 実装箇所

- `crates/ui/src/script/command.rs:148` `CreateShortcut,`
- `crates/ui/src/script/parser/brackets/handlers/raiselike.rs:178` `callback(SakuraCommand::CreateShortcut);`
- `ui/js/ghost/sakura-rust-bridge.js:222` `case "CreateShortcut":`
