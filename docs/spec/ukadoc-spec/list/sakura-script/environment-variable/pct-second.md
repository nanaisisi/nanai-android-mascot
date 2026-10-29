# %second

- **規格**: [pct-second.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/environment-variable/pct-second/) (ukadoc-spec/list/sakura-script/environment-variable/pct-second.md)
- **検索語**: second
- **対応状況**: ❌ 未実装(誤検出)

## 突合結果

ヒットしたのは無関係な語(変数名・URL 等)。該当の仕様に対応する処理は確認できない。

## 実装箇所

- `src-tauri/src/lib.rs:36` `commands::shiori::on_second_change,`
- `src-tauri/src/lib.rs:112` `commands::shiori::on_second_change,`
- `src-tauri/src/commands/shiori/protocol.rs:166` `pub async fn on_second_change() -> Result<String, String> {`
- `src-tauri/src/commands/install/utils.rs:89` `+ (dt.second() as u64);`
- `src-tauri/src/ghost/scan/date.rs:8` `let seconds = remainder % 60;`
