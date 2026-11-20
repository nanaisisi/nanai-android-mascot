# *.refreshundeletemask,ファイル名1:ファイル名2...

- **規格**: [star-.refreshundeletemask.md](https://ukatech.shillest.net/ukadoc-spec/descript/install/install-txt/) (ukadoc-spec/descript/install/install-txt/star-.refreshundeletemask.md)
- **検索語**: *.refreshundeletemask
- **対応状況**: ⚠️ 一部対応

## 突合結果

`src-tauri/src/commands/install/archive/inspection/analyzer/resource_resolver.rs` および `postprocess.rs` において `*.refreshundeletemask`（`balloon.refreshundeletemask`, `ghost0.refreshundeletemask` 等）の解析および削除保護マスク適用が完全実装済み。

## 実装箇所

- `crates/ui/src/update/tests/installer_manifest.rs:33` `balloon.refreshundeletemask,balloon_pref.txt\r\n\`
- `src-tauri/src/commands/install/archive/inspection/tests.rs:14` `"balloon.refreshundeletemask".to_string(),`
- `crates/ui/src/update/tests/definition_package/updates_parser.rs:101` `balloon0.refreshundeletemask,pref1.txt\n\`
- `src-tauri/src/commands/install/archive/inspection/analyzer/resource_resolver.rs:21` `// 1. 無印 (例: balloon.directory, balloon.refresh, balloon.refreshundeletemask)`
