# dev/nar.md 規格対応文書

- **参照規格**: [ukadoc-spec/dev/nar.md](../../../../ukadoc-spec/dev/nar.md) (NARアーカイブ構造)
- **対応状況**: ⚠️ 一部対応

## 突合結果

- `.nar` アーカイブの ZIP 展開、フォルダ構造の検証、および VFS (Virtual File System) による静的アセット解決の実装完了。

## 実装箇所

- `src-tauri/src/commands/web.rs:41` `let uri = "ukagaka://install?url=https%3A%2F%2Fexample.com%2Fghost.nar";`
- `src-tauri/src/commands/install/mod.rs:25` `.add_filter("Ghost archive", &["nar", "zip"])`
- `src-tauri/src/commands/install/mod.rs:53` `let zip = zip::ZipArchive::new(file).map_err(|e| format!("Invalid zip/nar archiv`
- `src-tauri/src/commands/install/mod.rs:78` `zip::ZipArchive::new(reader).map_err(|e| format!("Invalid zip/nar archive: {}", `
- `src-tauri/src/commands/install/archive/packaging.rs:32` `.map_err(|e| format!("Failed to create output directory for nar: {e}"))?;`
