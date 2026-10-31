# windowposition.limit,0/1

- **規格**: [windowposition.limit.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/) (ukadoc-spec/descript/balloon/descript-txt/windowposition.limit.md)
- **検索語**: windowposition.limit
- **対応状況**: ✅ 対応済

## 突合結果

`ui/js/core/actions/balloon-descript.js` にて `windowposition.limit` プロパティをパースし、`this.windowPositionLimit` として実装済み。

## 実装箇所

- `ui/js/core/actions/balloon-descript/layout.js:163` `// [windowposition.x,座標], [windowposition.y,座標], [windowposition.limit,0/1]:`
- `ui/js/core/actions/balloon-descript/layout.js:172` `props["windowposition.limit"] === "1" ||`
- `ui/js/core/actions/balloon-descript/layout.js:173` `props["windowposition.limit"]?.toLowerCase() === "true";`
- `tests/balloon-descript.test.js:79` `"windowposition.limit": "1",`
