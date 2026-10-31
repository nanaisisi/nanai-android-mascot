# dev/nar.md 規格対応文書

- **参照規格**: [ukadoc-spec/dev/nar.md](../../../../ukadoc-spec/dev/nar.md) (NARアーカイブ構造)
- **対応状況**: ✅ 対応済

## 突合結果

- `.nar` アーカイブの ZIP 展開、フォルダ構造の検証、および VFS (Virtual File System) による静的アセット解決の実装完了。

## 実装箇所

- `src-tauri/src/commands/web.rs:1` `//! Ukagaka Web Integration specification implementation (spec/web/x-ukagaka-lin`
- `src-tauri/src/commands/web.rs:2` `//! [x-ukagaka-link], [application-x-nar]`
- `src-tauri/src/commands/web.rs:42` `let uri = "ukagaka://install?url=https%3A%2F%2Fexample.com%2Fghost.nar";`
- `src-tauri/src/commands/install/mod.rs:24` `.add_filter("Ghost archive", &["nar", "zip"])`
- `src-tauri/src/commands/install/mod.rs:41` `/// ゴーストアーカイブ (.nar / .zip) のパス指定取り込み・解凍コマンド`
