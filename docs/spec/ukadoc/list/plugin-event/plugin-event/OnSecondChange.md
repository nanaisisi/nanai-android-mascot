# OnSecondChange

- **規格**: [OnSecondChange.md](https://ukatech.shillest.net/ukadoc-spec/list/plugin-event/plugin-event/OnSecondChange/) (ukadoc-spec/list/plugin-event/plugin-event/OnSecondChange.md)
- **検索語**: OnSecondChange
- **対応状況**: 🔎 コード上に出現(処理の有無は要読解)

## 突合結果

実装コードに「OnSecondChange」が出現。実際の処理内容は未精査。

## 実装箇所

- `ui/js/core/app-settings.js:87`  `this.ghostController.sendShioriEvent("OnSecondChange");`
- `src-tauri/src/commands/shiori/protocol.rs:32` (コメント) `// 既定は info（失敗のみ出力）、trace で全リクエスト/レスポンス、毎秒の OnSecondChange は NANAI_LOG=trace のときのみ`
- `src-tauri/src/commands/shiori/protocol.rs:34`  `let noisy = request.contains("ID: OnSecondChange");`
- `ui/js/ghost/ghost-shiori.js:22` (コメント) `// 自律タイマー (OnSecondChange) 開始`
- `ui/js/ghost/ghost-shiori.js:31` (コメント) `* OnSecondChange 定期イベントタイマー (毎秒送信)`
