# %month

- **規格**: [pct-month.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/environment-variable/pct-month/) (ukadoc-spec/list/sakura-script/environment-variable/pct-month.md)
- **検索語**: month
- **対応状況**: ✅ 実装済

## 突合結果

実装コード内に「month」を確認。

## 実装箇所

- `src-tauri/src/commands/install/utils.rs:57` `let month = dt.month() as usize;`
- `src-tauri/src/commands/install/utils.rs:59` `if year < 1970 || !(1..=12).contains(&month) || !(1..=31).contains(&day) {`
- `src-tauri/src/commands/install/utils.rs:69` `let days_in_months = [`
- `src-tauri/src/commands/install/utils.rs:83` `for &dim in &days_in_months[..(month - 1)] {`
- `src-tauri/src/ghost/scan/date.rs:21` `let mut month = 1;`
