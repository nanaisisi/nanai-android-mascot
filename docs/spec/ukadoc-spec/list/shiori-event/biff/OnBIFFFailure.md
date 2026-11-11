# OnBIFFFailure

- **規格**: [OnBIFFFailure.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-event/biff/OnBIFFFailure/) (ukadoc-spec/list/shiori-event/biff/OnBIFFFailure.md)
- **検索語**: OnBIFFFailure
- **対応状況**: ✅ 実装済

## 突合結果

`src-tauri/src/shiori/ffi.rs` の `on_biff_failure` リクエストビルダ、および `ui/js/core/app-actions.js` (`checkEmail`) からのエラー・障害通知送信が実装されている。

## 実装箇所

- `src-tauri/src/shiori/ffi/builder.rs:170` `.event("OnBIFFFailure")`
- `ui/ts/core/actions/network-actions.ts:47` `await gc.sendShioriEvent("OnBIFFFailure", ["connect", accountName]);`
- `tests/network-actions.test.ts:77` `assert.ok(eventsSent.some((e) => e.ev === "OnBIFFFailure"));`
