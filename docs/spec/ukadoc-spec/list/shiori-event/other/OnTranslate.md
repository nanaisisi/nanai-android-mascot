# OnTranslate

- **規格**: [OnTranslate.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-event/other/OnTranslate/) (ukadoc-spec/list/shiori-event/other/OnTranslate.md)
- **検索語**: OnTranslate
- **対応状況**: ❌ 検出なし

## 突合結果

実装コード内に「OnTranslate」を確認。


## 実装箇所

- `src-tauri/src/commands/shiori/protocol.rs:171` `/// SHIORI へ OnTranslate イベントを送信し、ゴースト側で翻訳されたさくらスクリプトを取得する (UKADOC 規格準拠)`
- `src-tauri/src/commands/shiori/protocol.rs:178` `let mut req = ShioriRequest::get("OnTranslate", std::slice::from_ref(&script));`
