# mousecursor.wait,ファイル名

- **規格**: [mousecursor.wait.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/) (ukadoc-spec/descript/balloon/descript-txt/mousecursor.wait.md)
- **検索語**: mousecursor.wait
- **対応状況**: ⚠️ 一部対応

## 突合結果

`app-actions.js` の `applyBalloonDescript()` にて `--balloon-cursor-wait` カスタムプロパティおよび CSS `cursor` スタイリングとして完全実装済。

## 実装箇所

- `src-tauri/src/shiori/property/evaluator/static_rules.rs:16` `"currentghost.balloon.mousecursor.wait" => "wait.cur",`
- `ui/ts/core/actions/balloon-descript/assets.ts:198` `// [mousecursor.wait,ファイル名]:`
- `ui/ts/core/actions/balloon-descript/assets.ts:199` `setMouseCursor("mousecursor.wait", "--balloon-cursor-wait");`
