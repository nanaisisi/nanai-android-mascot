# *.directory,ディレクトリ名

- **規格**: [star-.directory.md](https://ukatech.shillest.net/ukadoc-spec/descript/install/install-txt/) (ukadoc-spec/descript/install/install-txt/star-.directory.md)
- **検索語**: *.directory
- **対応状況**: ⚠️ 一部対応

## 突合結果

`src-tauri/src/commands/install/archive/inspection/analyzer/resource_resolver.rs` において `*.directory`（`balloon.directory`, `balloon0.directory` 等のマルチリソース・解凍先指定キー）の解析および展開先ディレクトリ割り振りが完全実装済み。

## 実装箇所

- `crates/ui/src/manifest/shell_manifest.rs:57` `&self.directory`
- `src-tauri/src/commands/install/archive/inspection/tests.rs:11` `map.insert("balloon.directory".to_string(), "balloon_main".to_string());`
- `ui/ts/surface/surface-manager.ts:855` `if (this.shellManifest.directory) {`
- `ui/ts/ui/app-menu.ts:78` `shellPath = sm.shellManifest.directory;`
- `crates/ui/src/manifest/shell_manifest.rs:115` `directory: self.directory.to_string_lossy().into_owned(),`
- `src-tauri/src/commands/install/archive/inspection/tests.rs:17` `map.insert("balloon0.directory".to_string(), "balloon_zero".to_string());`
