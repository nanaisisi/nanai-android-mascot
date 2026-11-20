# バルーンなどの同梱配布について

- **規格**: [nar.md](../../../../ukadoc-spec/dev/nar.md) ([公式版](https://ukatech.shillest.net/ukadoc-spec/dev/nar/))
- **検索語**: balloon.directory
- **対応状況**: ⚠️ 一部対応

## 突合結果

ゴーストへのバルーン等同梱パッケージの展開に対応。

## 実装箇所

- `crates/ui/src/update/parser/install_manifest.rs:71` `// 1. 無印 (例: balloon.directory)`
- `src-tauri/src/commands/install/archive/inspection/tests.rs:11` `map.insert("balloon.directory".to_string(), "balloon_main".to_string());`
- `crates/ui/src/update/tests/installer_manifest.rs:31` `balloon.directory,my_balloon\r\n\`
- `src-tauri/src/commands/install/archive/inspection/analyzer/resource_resolver.rs:21` `// 1. 無印 (例: balloon.directory, balloon.refresh, balloon.refreshundeletemask)`
- `crates/ui/src/update/tests/definition_package/updates_parser.rs:95` `balloon.directory:my_balloon\n\`
