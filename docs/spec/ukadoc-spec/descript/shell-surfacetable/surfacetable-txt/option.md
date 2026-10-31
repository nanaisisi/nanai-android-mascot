# option,オプション1,オプション2,...

- **規格**: [option.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell-surfacetable/surfacetable-txt/option/) (ukadoc-spec/descript/shell-surfacetable/surfacetable-txt/option.md)
- **検索語**: option
- **対応状況**: ✅ 対応済 (surfacetable.rs)

## 突合結果

surface-parser.js / surface-animation-manager.js に該当の解析・処理は確認できない。

## 実装箇所

- `src-tauri/src/commands/shell/animation.rs:59` `options: vec![],`
- `src-tauri/src/commands/update/generation.rs:18` `let dev_opt_path = dir.join("developer_options.txt");`
- `src-tauri/src/ghost/scan/directory/filter.rs:12` `/// Parse developer_options.txt if present`
- `src-tauri/src/ghost/scan/directory/filter.rs:13` `pub fn parse_developer_options(path: &Path) {`
- `src-tauri/src/ghost/scan/directory/filter.rs:14` `let dev_options_path = path.join("developer_options.txt");`
