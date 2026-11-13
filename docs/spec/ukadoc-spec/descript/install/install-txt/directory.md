# directory,ディレクトリ名

- **規格**: [directory.md](https://ukatech.shillest.net/ukadoc-spec/descript/install/install-txt/) (ukadoc-spec/descript/install/install-txt/directory.md)
- **検索語**: directory
- **対応状況**: ✅ 実装済

## 突合結果

`src-tauri/src/commands/install/archive.rs` において `directory` キーをパースし、解凍先フォルダ名 (`install_directory`) へ設定する実装が行われている。

## 実装箇所

- `crates/nanai-vfs/src/resolver/io_operations.rs:71` `format!("Not a directory: {}", relative_dir),`
- `src-tauri/src/lib.rs:145` `ghost::scan::directory::scan_ghost_directory,`
- `ui/assets/LICENSE-3RD-PARTY.html:9622` `file in a relevant directory) where a recipient would be likely to look`
- `ui/ts/ui/app-menu.ts:78` `if (!shellPath && sm?.shellManifest?.directory) {`
- `tests/app-actions.test.ts:86` `handle("open-ghost-directory");`
- `crates/nanai-vfs/src/resolver/vfs_trait.rs:34` `"Path is a directory, not a file: {}",`
