# \sID番号

- **規格**: [sID.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/surface/sID/) (ukadoc-spec/list/sakura-script/surface/sID.md)
- **検索語**: Surface
- **対応状況**: ⚠️ 一部対応

## 突合結果

\\s[ID] / \\sN サーフェス（表情・ポーズ）切替タグのパース処理を実装 (crates/ui/src/script/command.rs -> SakuraCommand::Surface)。

## 実装箇所

- `src-tauri/src/commands/file.rs:66` `shell_dir.join(format!("Surface{surface_id}.png")),`
- `src-tauri/src/commands/file.rs:67` `shell_dir.join(format!("Surface{surface_id_num:04}.png")),`
- `src-tauri/src/commands/file.rs:157` `"Surface image not found for surface_id: {surface_id} in shell: {shell_name}"`
- `src-tauri/src/commands/file.rs:182` `shell_dir.join(format!("Surface{surface_id}.pna")),`
- `src-tauri/src/commands/window/character_window.rs:233` `.ok_or_else(|| format!("Surface image not found for scope {}", scope_id))`
