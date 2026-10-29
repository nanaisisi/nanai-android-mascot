# OnSecondChange

- **規格**: [OnSecondChange.md](https://ukatech.shillest.net/ukadoc-spec/list/plugin-event/plugin-event/OnSecondChange/) (ukadoc-spec/list/plugin-event/plugin-event/OnSecondChange.md)
- **検索語**: OnSecondChange
- **対応状況**: ✅ 実装済(SHIORIへ送信)

## 突合結果

ヒットしたのは一般的な語「OnSecondChange」の無関係な出現。該当の仕様に対応する処理は確認できない。

## 実装箇所

- `src-tauri/src/commands/shiori/protocol.rs:58` `// 既定は info（失敗のみ出力）、trace で全リクエスト/レスポンス、毎秒の OnSecondChange は NANAI_LOG=trace のとき`
- `src-tauri/src/commands/shiori/protocol.rs:60` `let noisy = request.contains("ID: OnSecondChange");`
- `src-tauri/src/commands/shiori/protocol.rs:142` `if event != "OnSecondChange"`
- `src-tauri/src/shiori/ffi/builder.rs:101` `.event("OnSecondChange")`
- `crates/ui/src/shiori/mod.rs:79` `let text = "NOTIFY SHIORI/3.0\r\nCharset: UTF-8\r\nSender: NanaiAndroidMascot\r\`
