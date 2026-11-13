# dev/shell.md 規格対応文書

- **参照規格**: [ukadoc-spec/dev/shell.md](../../../../ukadoc-spec/dev/shell.md) (シェル仕様)
- **対応状況**: ✅ 実装済

## 突合結果

- `surfaces.txt` / `surfaces2.txt` パース、Seriko アニメーションタイムライン描画、当たり判定 (CollisionEx) の完全実装。

## 実装箇所

- `crates/nanai-core/src/install_protocol.rs:7` `"shell",`
- `src-tauri/src/events.rs:14` `} else if let Some(shell_name) = id.strip_prefix("shell:") {`
- `ui/ts/core/actions/install-protocol.ts:21` `"shell",`
- `ui/menu-iframe.html:56` `<button type="button" class="menu-item main-only has-submenu" id="shell-scale-ro`
- `tests/app-actions.test.ts:62` `handle("reset-shell-position");`
- `crates/nanai-core/src/install_protocol.rs:208` `assert_eq!(normalize_install_type(Some("SHELL")), "shell");`
