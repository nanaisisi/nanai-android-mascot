# \![execute,schedule-delete,UID,オプション...]

- **規格**: [bang-execute-schedule-delete-UID.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/misc/bang-execute-schedule-delete-UID/) (ukadoc-spec/list/sakura-script/misc/bang-execute-schedule-delete-UID.md)
- **検索語**: Command
- **対応状況**: ✅ 実装済

## 突合結果

`\![execute,schedule-delete,...]` (スケジュール削除) コマンドのパース処理を実装 (`crates/ui/src/script/parser/brackets/handlers/raiselike.rs` -> `SakuraCommand::Command`)。

## 実装箇所

- `src-tauri/build.rs:24` `let status = std::process::Command::new(std::env::var("CARGO").unwrap_or("cargo"`
- `src-tauri/tauri.conf.json:7` `"beforeDevCommand": "npm run dev",`
- `src-tauri/tauri.conf.json:8` `"beforeBuildCommand": "npm run build",`
- `src-tauri/tauri.test.conf.json:7` `"beforeDevCommand": "dx serve --port 1421",`
- `src-tauri/tauri.test.conf.json:9` `"beforeBuildCommand": "dx build --release",`
