# %second

- **規格**: [pct-second.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/environment-variable/pct-second/) (ukadoc-spec/list/sakura-script/environment-variable/pct-second.md)
- **検索語**: second
- **対応状況**: ✅ 実装済

## 突合結果

さくらスクリプト環境変数展開処理 (crates/ui/src/script/env.rs) にて対応する変数の置換処理を実装。



## 実装箇所

- `src-tauri/src/lib.rs:38` `commands::shiori::on_second_change,`
- `src-tauri/src/lib.rs:115` `commands::shiori::on_second_change,`
- `src-tauri/src/commands/ext.rs:47` `// [readme,ファイル名], [readme.charset,文字コード], [charset,文字コード], [secondchangeinterva`
- `src-tauri/src/commands/ext.rs:51` `let _sec_interval = map.get("secondchangeinterval");`
- `src-tauri/src/commands/install/utils.rs:91` `+ (dt.second() as u64);`
