# directory,ディレクトリ名

- **規格**: [directory.md](https://ukatech.shillest.net/ukadoc-spec/descript/install/install-txt/) (ukadoc-spec/descript/install/install-txt/directory.md)
- **検索語**: directory
- **対応状況**: ✅ 対応済

## 突合結果

`src-tauri/src/commands/install/archive.rs` において `directory` キーをパースし、解凍先フォルダ名 (`install_directory`) へ設定する実装が行われている。

## 実装箇所

- `src-tauri/gen/schemas/acl-manifests.json:1` `{"core":{"default_permission":{"identifier":"default","description":"Default cor`
- `src-tauri/gen/schemas/android-schema.json:236` `"description": "A path that can be opened by the webview when using the Opener A`
- `src-tauri/gen/schemas/android-schema.json:284` `"description": "A path that can be opened by the webview when using the Opener A`
- `src-tauri/gen/schemas/android-schema.json:942` `"description": "Default permissions for the plugin, which enables all commands.\`
- `src-tauri/gen/schemas/android-schema.json:945` `"markdownDescription": "Default permissions for the plugin, which enables all co`
