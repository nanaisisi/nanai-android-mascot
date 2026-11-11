# font.bold,0/1

- **規格**: [font.bold.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/) (ukadoc-spec/descript/balloon/descript-txt/font.bold.md)
- **検索語**: font.bold
- **対応状況**: ✅ 実装済

## 突合結果

`app-actions.js` の `applyBalloonDescript()` において `props["font.bold"] === "1"`（または `"true"`）を検出し、文書のルート要素に対して `--balloon-font-weight: bold` カスタムプロパティを動的設定する実装が行われている。

## 実装箇所

- `ui/ts/core/actions/balloon-descript/font/base.ts:34` `props["font.bold"] === "1" ||`
- `ui/ts/core/actions/balloon-descript/font/base.ts:35` `props["font.bold"]?.toLowerCase() === "true"`
- `tests/core-actions.test.ts:35` `"font.bold": "0",`
- `tests/frontend-coverage-boost.test.ts:22` `"font.bold": "1",`
- `tests/balloon-descript/all-properties/mock-props.ts:25` `"font.bold": "1",`
