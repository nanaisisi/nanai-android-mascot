# *.directory,ディレクトリ名

- **規格**: [star-.directory.md](https://ukatech.shillest.net/ukadoc-spec/descript/install/install-txt/) (ukadoc-spec/descript/install/install-txt/star-.directory.md)
- **検索語**: *.directory
- **対応状況**: ✅ 実装済

## 突合結果

`src-tauri/src/commands/install/archive/inspection/analyzer/resource_resolver.rs` において `*.directory`（`balloon.directory`, `balloon0.directory` 等のマルチリソース・解凍先指定キー）の解析および展開先ディレクトリ割り振りが完全実装済み。

## 実装箇所

- `src-tauri/src/commands/install/archive/inspection/analyzer/resource_resolver.rs` (`.directory`)
