# ディレクトリ構成 (manual/directory.md)

- **規格**: [manual/directory.md](https://github.com/ukatech/ukadoc-spec/blob/main/manual/directory.md)
- **対応状況**: ✅ 対応済 (実ファイルハンドリング実装済)

## 実ファイルハンドリング突合結果

- **VFS (仮想ファイルシステム) と大文字小文字の吸収**: `resolve_vfs_path` により、Windows / Android 間やゴーストフォルダ内の大文字小文字の違いを完全に吸収して実ファイルを探索。
- **優先順位付き走査 (`userData/ghost` vs `local/ghost`)**: `scan_ghost_directory` において `userData/ghost` を優先しつつ、内蔵アセットをフォールバックとして走査する仕組みを実装 (`src-tauri/src/ghost/scan/directory.rs`)。

## 実装箇所

- `src-tauri/gen/schemas/acl-manifests.json:1` `{"core":{"default_permission":{"identifier":"default","description":"Default cor`
- `src-tauri/gen/schemas/android-schema.json:236` `"description": "A path that can be opened by the webview when using the Opener A`
- `src-tauri/gen/schemas/android-schema.json:284` `"description": "A path that can be opened by the webview when using the Opener A`
- `src-tauri/gen/schemas/android-schema.json:942` `"description": "Default permissions for the plugin, which enables all commands.\`
- `src-tauri/gen/schemas/android-schema.json:945` `"markdownDescription": "Default permissions for the plugin, which enables all co`
