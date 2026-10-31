# 起動オプション一覧

- **規格**: [functions/option.md](https://ukatech.shillest.net/ukadoc-ssp/functions/option/) (ukadoc-ssp/functions/option.md)
- **対応状況**: ✅ 実装済

## 突合結果

倍率変更、クリックスルー透過、常時最前面

## 実装箇所

- `src-tauri/src/commands/shell/animation.rs:59` `options: vec![],`
- `src-tauri/src/ghost/scan/directory.rs:65` `// [developer_options.txt], [自動的に除外される対象], [相対パス,オプション1,オプション2,...]:`
- `src-tauri/src/ghost/scan/directory.rs:66` `let dev_options_path = path.join("developer_options.txt");`
- `src-tauri/src/ghost/scan/directory.rs:67` `if dev_options_path.exists()`
- `src-tauri/src/ghost/scan/directory.rs:68` `&& let Ok(dev_content) = std::fs::read_to_string(&dev_options_path)`
