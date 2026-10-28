# OnBIFFComplete

- **規格**: [OnBIFFComplete.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-event/biff/OnBIFFComplete/) (ukadoc-spec/list/shiori-event/biff/OnBIFFComplete.md)
- **検索語**: OnBIFFComplete
- **対応状況**: ✅ 対応済

## 突合結果

`src-tauri/src/shiori/ffi.rs` の `on_biff_complete` リクエストビルダ、および `ui/js/core/app-actions.js` (`checkEmail`) からのメールチェック完了通知送信が実装されている。

## 実装箇所

- `src-tauri/src/shiori/ffi.rs`: `on_biff_complete()`
- `ui/js/core/app-actions.js`: `checkEmail()` (OnBIFFComplete 送信)
