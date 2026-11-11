# mousecursor.text,ファイル名

- **規格**: [mousecursor.text.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/) (ukadoc-spec/descript/balloon/descript-txt/mousecursor.text.md)
- **検索語**: mousecursor.text
- **対応状況**: ⚠️ 一部対応

## 突合結果

`app-actions.js` の `applyBalloonDescript()` にて `--balloon-cursor-text` カスタムプロパティおよび CSS `cursor` スタイリングとして完全実装済。

## 実装箇所

- `src-tauri/src/shiori/property/evaluator/static_rules.rs:15` `"currentghost.balloon.mousecursor.text" => "text.cur",`
- `ui/ts/core/actions/balloon-descript/assets.ts:196` `// [mousecursor.text,ファイル名]:`
- `ui/ts/core/actions/balloon-descript/assets.ts:197` `setMouseCursor("mousecursor.text", "--balloon-cursor-text");`
