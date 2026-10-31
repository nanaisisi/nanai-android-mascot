# hwnd

- **規格**: [hwnd.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-event/notify/hwnd/) (ukadoc-spec/list/shiori-event/notify/hwnd.md)
- **検索語**: hwnd
- **対応状況**: ✅ 実装済

## 突合結果

実装コード内に「hwnd」を確認。

## 実装箇所

- `src-tauri/src/fmo.rs:21` `pub hwnd: u64,`
- `src-tauri/src/fmo.rs:49` `hwnd: 0,`
- `src-tauri/src/sstp.rs:14` `pub hwnd: Option<u64>,`
- `src-tauri/src/sstp.rs:50` `let mut hwnd = None;`
- `src-tauri/src/sstp.rs:67` `"hwnd" => hwnd = val.parse().ok(),`
