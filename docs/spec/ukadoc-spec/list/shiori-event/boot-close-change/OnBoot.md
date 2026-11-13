# OnBoot

- **規格**: [OnBoot.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-event/boot-close-change/OnBoot/) (ukadoc-spec/list/shiori-event/boot-close-change/OnBoot.md)
- **検索語**: OnBoot
- **対応状況**: ✅ 実装済

## 突合結果

OnBoot SHIORIイベント送信処理を実装 (ui/js/ghost/shiori-notify.js -> sendShioriNotify)。

## 実装箇所

- `crates/nanai-core/src/shiori_protocol.rs:82` `/// OnBoot / OnFirstBoot イベントリクエスト構築`
- `src-tauri/src/shiori/ffi/builder.rs:77` `.event("OnBoot")`
- `ui/main.ts:9` `* - OnBoot, OnClose, OnWindowStateMinimize, OnWindowStateRestore`
- `ui/ts/ui/modal-settings-handlers.ts:252` `bindShioriTestButton("test-shiori-init", "OnBoot", "SHIORI初期化");`
- `tests/ghost-loading.test.ts:54` `assert.equal(calls.includes("OnBoot"), false);`
- `crates/nanai-core/src/shiori_protocol.rs:84` `let event_id = if is_first_boot { "OnFirstBoot" } else { "OnBoot" };`
