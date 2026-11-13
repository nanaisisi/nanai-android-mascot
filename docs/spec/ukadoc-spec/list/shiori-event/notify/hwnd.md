# hwnd

- **規格**: [hwnd.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-event/notify/hwnd/) (ukadoc-spec/list/shiori-event/notify/hwnd.md)
- **検索語**: hwnd
- **対応状況**: ✅ 実装済

## 突合結果

実装コード内に「hwnd」を確認。

## 実装箇所

- `crates/nanai-core/src/sstp_fmo.rs:77` `pub hwnd: String,`
- `src-tauri/src/fmo.rs:41` `pub hwnd: u64,`
- `ui/ts/core/actions/sstp-fmo-actions.ts:14` `hwnd?: number;`
- `tests/sstp-fmo/fmo-actions.test.ts:38` `hwnd: 12345,`
- `crates/nanai-core/src/sstp_fmo.rs:100` `hwnd: String::new(),`
- `src-tauri/src/fmo.rs:79` `hwnd: 0,`
