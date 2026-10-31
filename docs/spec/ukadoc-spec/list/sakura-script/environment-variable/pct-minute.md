# %minute

- **規格**: [pct-minute.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/environment-variable/pct-minute/) (ukadoc-spec/list/sakura-script/environment-variable/pct-minute.md)
- **検索語**: minute
- **対応状況**: ✅ 実装済(誤検出)

## 突合結果

ヒットしたのは無関係な語(変数名・URL 等)。該当の仕様に対応する処理は確認できない。

## 実装箇所

- `src-tauri/src/commands/install/utils.rs:90` `+ (dt.minute() as u64) * 60`
- `src-tauri/src/ghost/scan/date.rs:7` `let minutes = (remainder % 3600) / 60;`
- `src-tauri/src/ghost/scan/date.rs:47` `year, month, day, hours, minutes, seconds`
- `src-tauri/src/shiori/ffi/builder.rs:105` `pub fn on_minute_change() -> Self {`
- `crates/ui/src/script/env.rs:20` `result = result.replace("%minute", &now.minute().to_string());`
