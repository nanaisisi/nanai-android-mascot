# %hour

- **規格**: [pct-hour.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/environment-variable/pct-hour/) (ukadoc-spec/list/sakura-script/environment-variable/pct-hour.md)
- **検索語**: hour
- **対応状況**: ❌ 検出なし

## 突合結果

実装コード内に「hour」を確認。


## 実装箇所

- `src-tauri/src/commands/install/utils.rs:89` `+ (dt.hour() as u64) * 3_600`
- `src-tauri/src/ghost/scan/date.rs:6` `let hours = remainder / 3600;`
- `src-tauri/src/ghost/scan/date.rs:47` `year, month, day, hours, minutes, seconds`
- `cpp/yaya-shiori/misc.cpp:969` `tmtime.tm_hour = stime.wHour;`
- `cpp/yaya-shiori/misc.cpp:1032` `t3 = tm.tm_hour;`
