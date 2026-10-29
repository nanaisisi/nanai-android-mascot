# hwnd

- **規格**: [hwnd.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-event/notify/hwnd/) (ukadoc-spec/list/shiori-event/notify/hwnd.md)
- **検索語**: hwnd
- **対応状況**: ❌ 検出なし

## 突合結果

実装コード内に「hwnd」を確認。


## 実装箇所

- `src-tauri/src/sstp.rs:11` `pub hwnd: Option<u64>,`
- `src-tauri/src/fmo.rs:21` `pub hwnd: u64,`
- `src-tauri/src/fmo.rs:51` `hwnd: 0,`
- `cpp/yaya-shiori/aya5.h:43` `extern "C" DLLEXPORT BOOL_TYPE FUNCATTRIB logsend(long hwnd);`
- `cpp/yaya-shiori/basis.h:106` `void	SetLogRcvWnd(long hwnd);`
