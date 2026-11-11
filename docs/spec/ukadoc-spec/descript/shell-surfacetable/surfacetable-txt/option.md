# option,オプション1,オプション2,...

- **規格**: [option.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell-surfacetable/surfacetable-txt/option/) (ukadoc-spec/descript/shell-surfacetable/surfacetable-txt/option.md)
- **検索語**: option
- **対応状況**: ⚠️ 一部対応

## 突合結果

surface-parser.js / surface-animation-manager.js に該当の解析・処理は確認できない。

## 実装箇所

- `src-tauri/src/ghost/scan/directory/filter.rs:21` `println!("🛠️ Developer option entry: {}", trimmed);`
- `crates/ui/src/descript/tests.rs:23` `let option = desc.bindoption_group("sakura").unwrap();`
- `crates/ui/src/descript/tests.rs:24` `assert_eq!(option.category, "服");`
- `crates/ui/src/descript/tests.rs:25` `assert_eq!(option.options, vec!["multiple".to_string()]);`
- `crates/ui/src/script/command.rs:124` `option: String,`
