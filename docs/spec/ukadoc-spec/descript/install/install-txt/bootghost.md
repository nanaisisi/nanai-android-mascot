# bootghost,ディレクトリ名

- **規格**: [bootghost.md](https://ukatech.shillest.net/ukadoc-spec/descript/install/install-txt/) (ukadoc-spec/descript/install/install-txt/bootghost.md)
- **検索語**: bootghost
- **対応状況**: ✅ 対応済

## 突合結果

`src-tauri/src/commands/install/archive.rs` において `bootghost` キーをパース・参照する実装が行われている。

## 実装箇所

- `src-tauri/src/commands/install/archive.rs:53` `// [install.txt（概要）], [同時インストール], [name,オブジェクト名], [type,種別], [directory,ディレクトリ名]`
- `src-tauri/src/commands/install/archive.rs:62` `let _bootghost = map.get("bootghost");`
