# シェル (manual/shell.md)

- **規格**: [manual/shell.md](https://github.com/ukatech/ukadoc-spec/blob/main/manual/shell.md)
- **対応状況**: ✅ 対応済 (実ファイルハンドリング実装済)

## 実ファイルハンドリング突合結果

- **サーフェス実ファイル画像読込**: `load_surface_image` により `surface*.png` / `surface*.bmp` を読み込み。
- **PNA アルファマスク処理**: `load_surface_pna` により対応する 8bit グレースケールマスク (`surface*.pna`) を読み込み、Canvas 2D コンポジタにて透過・抜き合わせ合成を実行 (`src-tauri/src/commands/file.rs`, `ui/js/surface/surface-compositor.js`)。

## 実装箇所

- `src-tauri/src/events.rs:14` `} else if let Some(shell_name) = id.strip_prefix("shell:") {`
- `src-tauri/src/events.rs:18` `"action": "switch-to-shell",`
- `src-tauri/src/events.rs:19` `"payload": shell_name`
- `src-tauri/src/lib.rs:97` `commands::shell::shell_manifest,`
- `src-tauri/src/lib.rs:98` `commands::shell::parse_sakura_script,`
