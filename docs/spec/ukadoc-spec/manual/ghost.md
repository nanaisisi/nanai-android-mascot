# ゴースト (manual/ghost.md)

- **規格**: [manual/ghost.md](https://github.com/ukatech/ukadoc-spec/blob/main/manual/ghost.md)
- **対応状況**: ✅ 対応済 (実ファイルハンドリング実装済)

## 実ファイルハンドリング突合結果

- **ゴースト走査と構造解決**: `ghost/master/` フォルダの検出、`descript.txt` のパース、SHIORI 動的ロード（`shiori.dll` / `.so` / WASM）の実ファイル解決に対応 (`src-tauri/src/ghost/scan/mod.rs`, `src-tauri/src/shiori/dynamic/`)。
- **除外制御**: `.dev_ignore` / `.narignore` / `.updateignore` の存在判定による不要ファイル除外処理を完備。


## 実装箇所

- `src-tauri/src/events.rs:6` `if let Some(ghost_name) = id.strip_prefix("ghost:") {`
- `src-tauri/src/events.rs:10` `"action": "switch-to-ghost",`
- `src-tauri/src/events.rs:11` `"payload": ghost_name`
- `src-tauri/src/fmo.rs:20` `pub ghosts: HashMap<String, FmoGhostStatus>,`
- `src-tauri/src/fmo.rs:29` `.current_ghost_name`
