# 起動オプション一覧

- **規格**: [functions/option.md](https://ukatech.shillest.net/ukadoc-ssp/functions/option/) (ukadoc-ssp/functions/option.md)
- **対応状況**: ✅ 実装済

## 突合結果

倍率変更、クリックスルー透過、常時最前面

## 実装箇所

- `src-tauri/src/commands/shell/animation.rs:59` `options: vec![],`
- `src-tauri/src/ghost/scan/shell.rs:103` `// [sakura.bindoption*.group,カテゴリ名,オプション], [kero.bindoption*.group,カテゴリ名,オプション],`
- `src-tauri/src/ghost/scan/directory/filter.rs:12` `/// Parse developer_options.txt if present`
- `src-tauri/src/ghost/scan/directory/filter.rs:13` `pub fn parse_developer_options(path: &Path) {`
- `src-tauri/src/ghost/scan/directory/filter.rs:14` `let dev_options_path = path.join("developer_options.txt");`
