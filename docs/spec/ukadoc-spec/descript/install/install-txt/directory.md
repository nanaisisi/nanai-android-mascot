# directory,ディレクトリ名

- **規格**: [directory.md](https://ukatech.shillest.net/ukadoc-spec/descript/install/install-txt/) (ukadoc-spec/descript/install/install-txt/directory.md)
- **検索語**: directory
- **対応状況**: ✅ 対応済

## 突合結果

`src-tauri/src/commands/install/archive.rs` において `directory` キーをパースし、解凍先フォルダ名 (`install_directory`) へ設定する実装が行われている。

## 実装箇所

- `src-tauri/src/commands/install/archive.rs` `// [install.txt（概要）]... [directory,ディレクトリ名]...`
