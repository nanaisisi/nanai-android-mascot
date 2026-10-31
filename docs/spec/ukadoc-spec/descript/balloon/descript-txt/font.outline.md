# font.outline,0/1

- **規格**: [font.outline.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/) (ukadoc-spec/descript/balloon/descript-txt/font.outline.md)
- **検索語**: font.outline
- **対応状況**: ✅ 対応済

## 突合結果

`ui/js/core/actions/balloon-descript/font.js` の `applyFontProperties()` において `props["font.outline"] === "1"`（または `"true"`）を検出し、`--balloon-font-outline: 1` カスタムプロパティを動的設定する実装が行われている。

## 実装箇所

- `ui/js/core/actions/balloon-descript/font/base.js:53` `props["font.outline"] === "1" ||`
- `ui/js/core/actions/balloon-descript/font/base.js:54` `props["font.outline"]?.toLowerCase() === "true"`
- `tests/balloon-descript.test.js:86` `"font.outline": "1",`
