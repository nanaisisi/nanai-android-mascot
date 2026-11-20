# OnTranslate

- **規格**: [OnTranslate.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-event/other/OnTranslate/) (ukadoc-spec/list/shiori-event/other/OnTranslate.md)
- **検索語**: OnTranslate
- **対応状況**: ⚠️ 一部対応

## 突合結果

実装コード内に「OnTranslate」を確認。

## 実装箇所

- `crates/ui/src/shiori/engine/tests/multistage_loader/fallback_reload/full_coverage.rs:181` `mock.set_response("OnTranslate", "\\0\\s[0]こんにちは（変換済）\\e");`
- `src-tauri/src/commands/shiori/protocol/events.rs:1` `//! 特殊イベント (MouseClick, SecondChange, OnTranslate, GhostCall) コマンド`
- `ui/ts/ghost/shiori-protocol.ts:201` `TRANSLATE: "OnTranslate",`
- `crates/ui/src/shiori/engine/tests/multistage_loader/fallback_reload/full_coverage.rs:199` `let req = "GET SHIORI/3.0\r\nSender: SSP\r\nCharset: UTF-8\r\nID: OnTranslate\r\`
- `src-tauri/src/commands/shiori/protocol/events.rs:22` `/// SHIORI へ OnTranslate イベントを送信し、ゴースト側で翻訳されたさくらスクリプトを取得する (UKADOC 規格準拠)`
- `crates/ui/src/sstp/config/ghost_config.rs:18` `/// sstp.alwaystranslate: 1 で SSTP オプションにかかわらず常時 OnTranslate を実行。デフォルトは 0`
