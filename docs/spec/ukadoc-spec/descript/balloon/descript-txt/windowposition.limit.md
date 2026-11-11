# windowposition.limit,0/1

- **規格**: [windowposition.limit.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/) (ukadoc-spec/descript/balloon/descript-txt/windowposition.limit.md)
- **検索語**: windowposition.limit
- **対応状況**: ✅ 実装済

## 突合結果

`ui/js/core/actions/balloon-descript.js` にて `windowposition.limit` プロパティをパースし、`this.windowPositionLimit` として実装済み。

## 実装箇所

- `ui/ts/core/actions/balloon-descript/layout/position.ts:49` `// [windowposition.x,座標], [windowposition.y,座標], [windowposition.limit,0/1]:`
- `ui/ts/core/actions/balloon-descript/layout/position.ts:58` `props["windowposition.limit"] === "1" ||`
- `ui/ts/core/actions/balloon-descript/layout/position.ts:59` `props["windowposition.limit"]?.toLowerCase() === "true";`
- `tests/balloon-descript/all-properties/mock-props.ts:22` `"windowposition.limit": "1",`
- `tests/balloon-descript-layout/position.test.ts:39` `"windowposition.limit": "true",`
