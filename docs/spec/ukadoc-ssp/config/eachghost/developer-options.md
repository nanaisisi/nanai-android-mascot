# 開発用オプション

- **規格**: [eachghost.md](../../../../ukadoc-ssp/config/eachghost.md) ([公式版](https://ukatech.shillest.net/ukadoc-ssp/config/eachghost/))
- **検索語**: eachghost, developer_options
- **対応状況**: ✅ 実装済

## 突合結果

ゴーストごとの開発用オプション設定は未実装。


## 実装箇所

- `crates/ui/src/update/parser/mod.rs:3` `pub mod developer_options;`
- `src-tauri/src/commands/install/archive/packaging.rs:45` `let dev_opts_path = source_dir.join("developer_options.txt");`
- `tests/install-update-protocol.test.ts:121` `it("identifies noupdate paths from developer_options patterns", async () => {`
- `crates/ui/src/update/parser/mod.rs:7` `pub use developer_options::parse_developer_options;`
- `src-tauri/src/commands/install/archive/packaging.rs:251` `source_dir.join("developer_options.txt"),`
- `src-tauri/src/commands/install/archive/packaging.rs:270` `assert_eq!(count, 3); // developer_options.txt, readme.txt, ghost/master/descrip`
