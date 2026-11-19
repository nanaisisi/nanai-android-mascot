# mousecursor.text,ファイル名

- **規格**: [mousecursor.text.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/) (ukadoc-spec/descript/balloon/descript-txt/mousecursor.text.md)
- **検索語**: mousecursor.text
- **対応状況**: ✅ 実装済

## 突合結果

`ui/ts/core/actions/balloon-descript/assets.ts` の `setMouseCursor()` にて `--balloon-cursor-text` カスタムプロパティおよび CSS `cursor` スタイリングとして完全実装済み。

## 実装箇所

- `src-tauri/src/shiori/property/evaluator/static_rules.rs` (`currentghost.balloon.mousecursor.text`)
- `ui/ts/core/actions/balloon-descript/assets.ts` (`mousecursor.text`)
