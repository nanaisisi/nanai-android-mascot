# dev/shell.md 規格対応文書

- **参照規格**: [ukadoc-spec/dev/shell.md](../../../../ukadoc-spec/dev/shell.md) (シェル仕様)
- **対応状況**: ✅ 対応済

## 突合結果
- `surfaces.txt` / `surfaces2.txt` パース、Seriko アニメーションタイムライン描画、当たり判定 (CollisionEx) の完全実装。

## 実装箇所

- `src-tauri/gen/schemas/android-schema.json:87` `"description": "List of permissions attached to this capability.\n\nMust include`
- `src-tauri/gen/schemas/desktop-schema.json:87` `"description": "List of permissions attached to this capability.\n\nMust include`
- `src-tauri/gen/schemas/mobile-schema.json:87` `"description": "List of permissions attached to this capability.\n\nMust include`
- `src-tauri/gen/schemas/windows-schema.json:87` `"description": "List of permissions attached to this capability.\n\nMust include`
- `src-tauri/src/events.rs:14` `} else if let Some(shell_name) = id.strip_prefix("shell:") {`
