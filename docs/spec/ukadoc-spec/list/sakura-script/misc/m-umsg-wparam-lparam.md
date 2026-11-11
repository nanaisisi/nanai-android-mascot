# \m[umsg,wparam,lparam]

- **規格**: [m-umsg-wparam-lparam.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/misc/m-umsg-wparam-lparam/) (ukadoc-spec/list/sakura-script/misc/m-umsg-wparam-lparam.md)
- **検索語**: \m
- **対応状況**: ⚠️ 一部対応

## 突合結果

実装コード内に「\m」を確認。

## 実装箇所

- `src-tauri/src/common/vfs.rs:71` `sanitize_vfs_path("shell\\master/surface0000.png"),`
- `crates/nanai-core/src/update_protocol.rs:239` `assert!(is_no_update_path("ghost\\master\\noupdate.txt", &patterns));`
- `crates/ui/src/script/command.rs:28` `}, // \m[umsg,wparam,lparam] (m-umsg-wparam-lparam.md)`
- `crates/ui/src/script/parser/executor.rs:98` `// \m[umsg,wparam,lparam] (m-umsg-wparam-lparam.md)`
- `crates/ui/src/tests/sakura_script.rs:189` `let script = r"\0\m[1024,10,20]本文";`
