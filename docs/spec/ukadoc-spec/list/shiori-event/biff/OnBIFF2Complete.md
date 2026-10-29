# OnBIFF2Complete

- **規格**: [OnBIFF2Complete.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-event/biff/OnBIFF2Complete/) (ukadoc-spec/list/shiori-event/biff/OnBIFF2Complete.md)
- **検索語**: OnBIFF2Complete
- **対応状況**: ✅ 対応済

## 突合結果

`src-tauri/src/shiori/ffi.rs` の `on_biff_2_complete` リクエストビルダ、および `ui/js/core/app-actions.js` (`checkEmail`) からのヘッダ情報付き詳細メールチェック完了通知送信が実装されている。

## 実装箇所

- `src-tauri/src/shiori/ffi/builder.rs:149` `.event("OnBIFF2Complete")`
- `ui/js/core/actions/network-actions.js:26` `await gc.sendShioriEvent("OnBIFF2Complete", [`
