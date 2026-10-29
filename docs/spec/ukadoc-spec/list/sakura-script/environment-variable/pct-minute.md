# %minute

- **規格**: [pct-minute.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/environment-variable/pct-minute/) (ukadoc-spec/list/sakura-script/environment-variable/pct-minute.md)
- **検索語**: minute
- **対応状況**: ❌ 未実装(誤検出)

## 突合結果

ヒットしたのは無関係な語(変数名・URL 等)。該当の仕様に対応する処理は確認できない。

## 実装箇所

- `src-tauri/src/commands/install/utils.rs:88` `+ (dt.minute() as u64) * 60`
- `src-tauri/src/ghost/scan/date.rs:7` `let minutes = (remainder % 3600) / 60;`
- `src-tauri/src/ghost/scan/date.rs:32` `Some(format!("{:04}-{:02}-{:02} {:02}:{:02}:{:02}", year, month, day, hours, min`
- `src-tauri/src/shiori/ffi/builder.rs:105` `pub fn on_minute_change() -> Self {`
- `cpp/yaya-shiori/sysfunc.cpp:4214` `*  返値　　：  year,month,day,week(0-6),hour,minute,secondの汎用配列`
