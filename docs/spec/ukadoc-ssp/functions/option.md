# 起動オプション一覧

- **規格**: [functions/option.md](https://ukatech.shillest.net/ukadoc-ssp/functions/option/) (ukadoc-ssp/functions/option.md)
- **対応状況**: ⚠️ 一部対応

## 突合結果

倍率変更、クリックスルー透過、常時最前面

## 実装箇所

- `src-tauri/src/ghost/scan/directory/filter.rs:21` `println!("🛠️ Developer option entry: {}", trimmed);`
- `crates/ui/src/descript/tests.rs:23` `let option = desc.bindoption_group("sakura").unwrap();`
- `crates/ui/src/descript/tests.rs:24` `assert_eq!(option.category, "服");`
- `crates/ui/src/descript/tests.rs:25` `assert_eq!(option.options, vec!["multiple".to_string()]);`
- `crates/ui/src/script/command.rs:124` `option: String,`
