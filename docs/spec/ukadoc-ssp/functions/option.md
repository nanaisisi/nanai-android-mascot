# 起動オプション一覧

- **規格**: [functions/option.md](https://ukatech.shillest.net/ukadoc-ssp/functions/option/) (ukadoc-ssp/functions/option.md)
- **対応状況**: ✅ 実装済

## 突合結果

倍率変更、クリックスルー透過、常時最前面

## 実装箇所

- `src-tauri/src/commands/install/archive/packaging.rs:41` `let options = SimpleFileOptions::default()`
- `src-tauri/src/commands/install/archive/packaging.rs:69` `zip_writer.add_directory(&dir_name, options)`
- `src-tauri/src/commands/install/archive/packaging.rs:76` `zip_writer.start_file(&name_str, options)`
- `src-tauri/src/commands/shell/animation.rs:59` `options: vec![],`
- `src-tauri/src/commands/update/generation.rs:18` `let dev_opt_path = dir.join("developer_options.txt");`
