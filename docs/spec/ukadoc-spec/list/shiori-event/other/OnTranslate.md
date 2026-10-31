# OnTranslate

- **規格**: [OnTranslate.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-event/other/OnTranslate/) (ukadoc-spec/list/shiori-event/other/OnTranslate.md)
- **検索語**: OnTranslate
- **対応状況**: ✅ 実装済

## 突合結果

実装コード内に「OnTranslate」を確認。

## 実装箇所

- `src-tauri/src/commands/shiori/protocol.rs:109` `/// [@manual: manual/translator.md] Translator integration / OnTranslate hook su`
- `src-tauri/src/commands/shiori/protocol.rs:172` `/// SHIORI へ OnTranslate イベントを送信し、ゴースト側で翻訳されたさくらスクリプトを取得する (UKADOC 規格準拠)`
- `src-tauri/src/commands/shiori/protocol.rs:179` `let mut req = ShioriRequest::get("OnTranslate", std::slice::from_ref(&script));`
- `ui/js/ghost/sakura-play/translator.js:7` `"OnTranslate",`
- `ui/js/ghost/sakura-play/translator.js:15` `// OnTranslate failure falls back to original script`
