# シェル (manual/shell.md)

- **規格**: [manual/shell.md](https://github.com/ukatech/ukadoc-spec/blob/main/manual/shell.md)
- **対応状況**: ✅ 対応済 (実ファイルハンドリング実装済)

## 実ファイルハンドリング突合結果

- **サーフェス実ファイル画像読込**: `load_surface_image` により `surface*.png` / `surface*.bmp` を読み込み。
- **PNA アルファマスク処理**: `load_surface_pna` により対応する 8bit グレースケールマスク (`surface*.pna`) を読み込み、Canvas 2D コンポジタにて透過・抜き合わせ合成を実行 (`src-tauri/src/commands/file.rs`, `ui/js/surface/surface-compositor.js`)。


## 実装箇所

- `src-tauri/gen/schemas/android-schema.json:87` `"description": "List of permissions attached to this capability.\n\nMust include`
- `src-tauri/gen/schemas/desktop-schema.json:87` `"description": "List of permissions attached to this capability.\n\nMust include`
- `src-tauri/gen/schemas/mobile-schema.json:87` `"description": "List of permissions attached to this capability.\n\nMust include`
- `src-tauri/gen/schemas/windows-schema.json:87` `"description": "List of permissions attached to this capability.\n\nMust include`
- `src-tauri/src/events.rs:14` `} else if let Some(shell_name) = id.strip_prefix("shell:") {`
