# OnChoiceSelect

- **規格**: [OnChoiceSelect.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-event/choice/OnChoiceSelect/) (ukadoc-spec/list/shiori-event/choice/OnChoiceSelect.md)
- **検索語**: OnChoiceSelect
- **対応状況**: ✅ 実装済

## 突合結果

OnChoiceSelect 選択肢/アンカー関連SHIORIイベント処理を実装 (ui/js/ghost/shiori-notify.js -> sendShioriNotify, crates/ui/src/script/command.rs).

## 実装箇所

- `crates/nanai-core/src/shiori_protocol.rs:123` `/// OnChoiceSelect イベントリクエスト構築`
- `ui/ts/core/app-actions.ts:6` `* - OnChoiceSelect: リコメンド・ポータル等の選択イベント`
- `ui/ts/ui/renderers/modal-dialog-choices.ts:63` `this.app.ghostController?.sendShioriEvent("OnChoiceSelect", [id, text]);`
- `tests/command-handler-registry.test.ts:103` `it("dispatches choice label jump via OnChoiceSelect", async () => {`
- `crates/nanai-core/src/shiori_protocol.rs:126` `build_shiori_request_extended("GET", "OnChoiceSelect", &refs, None)`
- `ui/ts/core/actions/menu-action-dispatcher.ts:8` `recommend: ["OnChoiceSelect", ["recommendlink"]],`
