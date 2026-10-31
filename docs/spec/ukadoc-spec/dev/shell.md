# dev/shell.md 規格対応文書

- **参照規格**: [ukadoc-spec/dev/shell.md](../../../../ukadoc-spec/dev/shell.md) (シェル仕様)
- **対応状況**: ✅ 対応済

## 突合結果

- `surfaces.txt` / `surfaces2.txt` パース、Seriko アニメーションタイムライン描画、当たり判定 (CollisionEx) の完全実装。

## 実装箇所

- `src-tauri/src/events.rs:14` `} else if let Some(shell_name) = id.strip_prefix("shell:") {`
- `src-tauri/src/events.rs:18` `"action": "switch-to-shell",`
- `src-tauri/src/events.rs:19` `"payload": shell_name`
- `src-tauri/src/lib.rs:97` `commands::shell::shell_manifest,`
- `src-tauri/src/lib.rs:98` `commands::shell::parse_sakura_script,`
