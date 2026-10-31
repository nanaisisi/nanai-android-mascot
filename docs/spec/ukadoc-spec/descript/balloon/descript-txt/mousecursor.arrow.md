# mousecursor.arrow,ファイル名

- **規格**: [mousecursor.arrow.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/) (ukadoc-spec/descript/balloon/descript-txt/mousecursor.arrow.md)
- **検索語**: mousecursor.arrow
- **対応状況**: ✅ 対応済

## 突合結果

`app-actions.js` の `applyBalloonDescript()` にて `--balloon-cursor-arrow` カスタムプロパティおよび CSS `cursor` スタイリングとして完全実装済。

## 実装箇所

- `ui/js/core/actions/balloon-descript/assets.js:62` `// [mousecursor.arrow,ファイル名]:`
- `ui/js/core/actions/balloon-descript/assets.js:63` `setMouseCursor("mousecursor.arrow", "--balloon-cursor-arrow");`
