# トランスレータ仕様の項目別突合

- **規格**: [ukadoc-spec/manual/translator.md](https://github.com/ukatech/ukadoc-spec/blob/main/manual/translator.md)
- **判定基準**: このリポジトリで確認できる OnTranslate イベントフックおよびスクリプト動的置換処理

| 項目                                      | 対応状況 |
| ----------------------------------------- | -------- |
| [OnTranslate イベント (`OnTranslate`)](ontranslate-event.md) | ✅ 実装済  |
| [スクリプト変換パイプライン](script-pipeline.md)       | ✅ 実装済  |

## 対応範囲の共通事項

- SHIORI から返却されたさくらスクリプトに対し、再生直前に `OnTranslate` イベントを送信して文字列を動的置換。
