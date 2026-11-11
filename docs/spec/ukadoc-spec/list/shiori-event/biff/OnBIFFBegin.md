# OnBIFFBegin

- **規格**: [OnBIFFBegin.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-event/biff/OnBIFFBegin/) (ukadoc-spec/list/shiori-event/biff/OnBIFFBegin.md)
- **検索語**: OnBIFFBegin
- **対応状況**: ✅ 実装済

## 突合結果

`src-tauri/src/shiori/ffi.rs` の `on_biff_begin` リクエストビルダ、および `ui/js/core/app-actions.js` (`checkEmail`) からの呼び出し・メニュー `ui/menu-iframe.html` 連携が実装されている。

## 実装箇所

- `src-tauri/src/shiori/ffi/builder.rs:129` `.event("OnBIFFBegin")`
- `ui/ts/core/actions/network-actions.ts:13` `await gc.sendShioriEvent("OnBIFFBegin", [accountName]);`
- `tests/network-actions.test.ts:27` `assert.ok(eventsSent.some((e) => e.ev === "OnBIFFBegin"));`
- `tests/network-actions.test.ts:72` `if (ev === "OnBIFFBegin") throw new Error("Shiori error");`
