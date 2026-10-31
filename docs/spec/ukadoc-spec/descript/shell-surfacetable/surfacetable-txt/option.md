# option,オプション1,オプション2,...

- **規格**: [option.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell-surfacetable/surfacetable-txt/option/) (ukadoc-spec/descript/shell-surfacetable/surfacetable-txt/option.md)
- **検索語**: option
- **対応状況**: ✅ 対応済 (surfacetable.rs)

## 突合結果

surface-parser.js / surface-animation-manager.js に該当の解析・処理は確認できない。

## 実装箇所

- `src-tauri/src/commands/shell/animation.rs:59` `options: vec![],`
- `src-tauri/src/ghost/scan/directory.rs:65` `// [developer_options.txt], [自動的に除外される対象], [相対パス,オプション1,オプション2,...]:`
- `src-tauri/src/ghost/scan/directory.rs:66` `let dev_options_path = path.join("developer_options.txt");`
- `src-tauri/src/ghost/scan/directory.rs:67` `if dev_options_path.exists()`
- `src-tauri/src/ghost/scan/directory.rs:68` `&& let Ok(dev_content) = std::fs::read_to_string(&dev_options_path)`
