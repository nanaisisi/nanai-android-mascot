# OnSecondChange

- **規格**: [OnSecondChange.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-event/time/OnSecondChange/) (ukadoc-spec/list/shiori-event/time/OnSecondChange.md)
- **検索語**: OnSecondChange
- **対応状況**: ✅ 実装済

## 突合結果

UI/Rust 側から sendShioriEvent 等でイベントを送信している(実装箇所を参照)。

## 実装箇所

- `crates/nanai-shiori-vm/src/lib.rs:45` `if request.contains("ID: OnSecondChange") {`
- `src-tauri/src/commands/shiori/protocol.rs:58` `// 既定は info（失敗のみ出力）、trace で全リクエスト/レスポンス、毎秒の OnSecondChange は NANAI_LOG=trace のとき`
- `ui/ts/ghost/ghost-shiori.ts:121` `await this.sendShioriEvent("OnSecondChange", [`
- `ui/ts/ui/modal-settings-handlers.ts:255` `"OnSecondChange",`
- `tests/ghost-shiori.test.ts:81` `// Test timer interval (OnSecondChange & OnMinuteChange at 60s)`
- `crates/ui/src/shiori/engine/mock.rs:29` `"OnSecondChange".to_string(),`
