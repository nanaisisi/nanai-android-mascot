# %second

- **規格**: [pct-second.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/environment-variable/pct-second/) (ukadoc-spec/list/sakura-script/environment-variable/pct-second.md)
- **検索語**: second
- **対応状況**: ❌ 未実装(誤検出)

## 突合結果

ヒットしたのは無関係な語(変数名・URL 等)。該当の仕様に対応する処理は確認できない。

## 実装箇所

- `src-tauri/src/lib.rs:38` `commands::shiori::on_second_change,`
- `src-tauri/src/lib.rs:114` `commands::shiori::on_second_change,`
- `src-tauri/src/commands/ext.rs:41` `// [readme,ファイル名], [readme.charset,文字コード], [charset,文字コード], [secondchangeinterva`
- `src-tauri/src/commands/ext.rs:45` `let _sec_interval = map.get("secondchangeinterval");`
- `src-tauri/src/commands/install/utils.rs:89` `+ (dt.second() as u64);`
