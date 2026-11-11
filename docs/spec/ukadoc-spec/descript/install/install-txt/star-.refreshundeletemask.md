# *.refreshundeletemask,ファイル名1:ファイル名2...

- **規格**: [star-.refreshundeletemask.md](https://ukatech.shillest.net/ukadoc-spec/descript/install/install-txt/) (ukadoc-spec/descript/install/install-txt/star-.refreshundeletemask.md)
- **検索語**: *.refreshundeletemask
- **対応状況**: ⚠️ 一部対応

## 突合結果

`src-tauri/src/commands/install/archive.rs` において `*.refreshundeletemask`（`ghost.refreshundeletemask` 等）をパース・参照する実装が行われている。

## 実装箇所

- `src-tauri/src/commands/install/archive/inspection/tests.rs:12` `"balloon.refreshundeletemask".to_string(),`
- `src-tauri/src/commands/install/archive/inspection/analyzer/resource_resolver.rs:21` `// 1. 無印 (例: balloon.directory, balloon.refresh, balloon.refreshundeletemask)`
- `crates/ui/src/update/tests/definition_package.rs:133` `balloon0.refreshundeletemask,pref1.txt\n\`
- `crates/ui/src/update/tests/installer_manifest.rs:33` `balloon.refreshundeletemask,balloon_pref.txt\r\n\`
