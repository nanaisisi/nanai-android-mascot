# OnSecondChange

- **規格**: [OnSecondChange.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-event/time/OnSecondChange/) (ukadoc-spec/list/shiori-event/time/OnSecondChange.md)
- **検索語**: OnSecondChange
- **対応状況**: ✅ 実装済(SHIORIへ送信)

## 突合結果

UI/Rust 側から sendShioriEvent 等でイベントを送信している(実装箇所を参照)。

## 実装箇所

- `ui/js/core/app-settings.js:87` `this.ghostController.sendShioriEvent("OnSecondChange");`
- `src-tauri/src/commands/shiori/protocol.rs:32` (コメント) `// 既定は info（失敗のみ出力）、trace で全リクエスト/レスポンス、毎秒の OnSecondChange は NANAI_LOG=trace のときのみ`
- `src-tauri/src/commands/shiori/protocol.rs:34` `let noisy = request.contains("ID: OnSecondChange");`
- `ui/js/ghost/ghost-shiori.js:22` (コメント) `// 自律タイマー (OnSecondChange) 開始`
- `ui/js/ghost/ghost-shiori.js:31` (コメント) `* OnSecondChange 定期イベントタイマー (毎秒送信)`
