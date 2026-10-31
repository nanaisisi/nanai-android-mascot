# %minute

- **規格**: [pct-minute.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/environment-variable/pct-minute/) (ukadoc-spec/list/sakura-script/environment-variable/pct-minute.md)
- **検索語**: minute
- **対応状況**: ✅ 実装済

## 突合結果

さくらスクリプト環境変数展開処理 (crates/ui/src/script/env.rs) にて対応する変数の置換処理を実装。



## 実装箇所

- `src-tauri/src/commands/install/utils.rs:90` `+ (dt.minute() as u64) * 60`
- `src-tauri/src/ghost/scan/date.rs:7` `let minutes = (remainder % 3600) / 60;`
- `src-tauri/src/ghost/scan/date.rs:47` `year, month, day, hours, minutes, seconds`
- `src-tauri/src/shiori/ffi/builder.rs:105` `pub fn on_minute_change() -> Self {`
- `crates/ui/src/script/env.rs:22` `result = result.replace("%minute", &now.minute().to_string());`
