# font.italic,0/1

- **規格**: [font.italic.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/) (ukadoc-spec/descript/balloon/descript-txt/font.italic.md)
- **検索語**: font.italic
- **対応状況**: ✅ 実装済

## 突合結果

`app-actions.js` の `applyBalloonDescript()` において `props["font.italic"] === "1"`（または `"true"`）を検出し、文書のルート要素に対して `--balloon-font-style: italic` カスタムプロパティを動的設定する実装が行われている。

## 実装箇所

- `ui/ts/core/actions/balloon-descript/font/base.ts:41` `props["font.italic"] === "1" ||`
- `ui/ts/core/actions/balloon-descript/font/base.ts:42` `props["font.italic"]?.toLowerCase() === "true"`
- `tests/core-actions.test.ts:36` `"font.italic": "false",`
- `tests/frontend-coverage-boost.test.ts:23` `"font.italic": "true",`
- `tests/balloon-descript/all-properties/mock-props.ts:26` `"font.italic": "true",`
