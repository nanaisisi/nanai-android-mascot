# option,オプション1,オプション2,...

- **規格**: [option.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell-surfacetable/surfacetable-txt/option/) (ukadoc-spec/descript/shell-surfacetable/surfacetable-txt/option.md)
- **検索語**: option
- **対応状況**: ✅ 対応済 (surfacetable.rs)

## 突合結果

surface-parser.js / surface-animation-manager.js に該当の解析・処理は確認できない。

## 実装箇所

- `src-tauri/src/commands/install/archive/packaging.rs:41` `let options = SimpleFileOptions::default()`
- `src-tauri/src/commands/install/archive/packaging.rs:69` `zip_writer.add_directory(&dir_name, options)`
- `src-tauri/src/commands/install/archive/packaging.rs:76` `zip_writer.start_file(&name_str, options)`
- `src-tauri/src/commands/shell/animation.rs:59` `options: vec![],`
- `src-tauri/src/commands/update/generation.rs:18` `let dev_opt_path = dir.join("developer_options.txt");`
