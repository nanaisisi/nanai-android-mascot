# *.source.directory,ディレクトリ名

- **規格**: [star-.source.directory.md](https://ukatech.shillest.net/ukadoc-spec/descript/install/install-txt/) (ukadoc-spec/descript/install/install-txt/star-.source.directory.md)
- **検索語**: *.source.directory
- **対応状況**: ✅ 実装済

## 突合結果

`src-tauri/src/commands/install/archive/inspection/analyzer/resource_resolver.rs` において `*.source.directory`（`balloon.source.directory`, `shell0.source.directory` 等）の解析およびアーカイブ内ソースディレクトリ特定処理が完全実装済み。

## 実装箇所

- `src-tauri/src/commands/install/archive/inspection/analyzer/resource_resolver.rs` (`.source.directory`)
