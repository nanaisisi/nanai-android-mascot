# font.bold,0/1

- **規格**: [font.bold.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/) (ukadoc-spec/descript/balloon/descript-txt/font.bold.md)
- **検索語**: font.bold
- **対応状況**: ✅ 対応済

## 突合結果

`app-actions.js` の `applyBalloonDescript()` において `props["font.bold"] === "1"`（または `"true"`）を検出し、文書のルート要素に対して `--balloon-font-weight: bold` カスタムプロパティを動的設定する実装が行われている。


## 実装箇所

- `ui/js/core/actions/balloon-descript/font.js:29` `// [font.bold,0/1]: props["font.bold"]`
- `ui/js/core/actions/balloon-descript/font.js:31` `props["font.bold"] === "1" ||`
- `ui/js/core/actions/balloon-descript/font.js:32` `props["font.bold"]?.toLowerCase() === "true"`
- `tests/balloon-descript.test.js:76` `"font.bold": "1",`
- `tests/core-actions.test.js:35` `"font.bold": "0",`
