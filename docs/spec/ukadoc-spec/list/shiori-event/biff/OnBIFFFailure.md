# OnBIFFFailure

- **規格**: [OnBIFFFailure.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-event/biff/OnBIFFFailure/) (ukadoc-spec/list/shiori-event/biff/OnBIFFFailure.md)
- **検索語**: OnBIFFFailure
- **対応状況**: ✅ 対応済

## 突合結果

`src-tauri/src/shiori/ffi.rs` の `on_biff_failure` リクエストビルダ、および `ui/js/core/app-actions.js` (`checkEmail`) からのエラー・障害通知送信が実装されている。

## 実装箇所

- `src-tauri/src/shiori/ffi/builder.rs:165` `.event("OnBIFFFailure")`
- `ui/js/core/actions/network-actions.js:49` `await gc.sendShioriEvent("OnBIFFFailure", ["connect", accountName]);`
