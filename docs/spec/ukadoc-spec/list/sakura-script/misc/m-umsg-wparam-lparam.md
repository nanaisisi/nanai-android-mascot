# \m[umsg,wparam,lparam]

- **規格**: [m-umsg-wparam-lparam.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/misc/m-umsg-wparam-lparam/) (ukadoc-spec/list/sakura-script/misc/m-umsg-wparam-lparam.md)
- **検索語**: \m
- **対応状況**: ✅ 実装済

## 突合結果

実装コード内に「\m」を確認。

## 実装箇所

- `crates/nanai-core/src/update_protocol.rs:311` `assert!(is_no_update_path("ghost\\master\\noupdate.txt", &patterns));`
- `src-tauri/src/common/vfs.rs:71` `sanitize_vfs_path("shell\\master/surface0000.png"),`
- `ui/ts/ghost/parser/tag/interactive.ts:3` `* @brief アンカー・内部コマンド・メッセージ・選択肢タグのトークナイズ処理 (\_a, \!, \m, \q, \__q)`
- `tests/install-update-protocol.test.ts:128` `expect(isNoUpdatePath("ghost\\master\\dev.log", patterns)).toBe(true);`
- `crates/ui/src/script/command.rs:28` `}, // \m[umsg,wparam,lparam] (m-umsg-wparam-lparam.md)`
- `tests/nanai-core-wasm.test.ts:59` `"ghost\\master\\dev.log",`
