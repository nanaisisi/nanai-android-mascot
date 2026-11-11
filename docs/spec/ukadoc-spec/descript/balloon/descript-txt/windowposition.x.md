# windowposition.x,座標

- **規格**: [windowposition.x.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/) (ukadoc-spec/descript/balloon/descript-txt/windowposition.x.md)
- **検索語**: windowposition.x
- **対応状況**: ✅ 実装済

## 突合結果

`ui/js/core/actions/balloon-descript/layout.js` の `applyLayoutProperties()` において `props["windowposition.x"]` をパースし、`--balloon-windowpos-x` カスタムプロパティへ反映する実装が行われている。

## 実装箇所

- `ui/ts/core/actions/balloon-descript/layout/position.ts:49` `// [windowposition.x,座標], [windowposition.y,座標], [windowposition.limit,0/1]:`
- `ui/ts/core/actions/balloon-descript/layout/position.ts:50` `const wpX = parseInt(props["windowposition.x"], 10);`
- `tests/frontend-coverage-boost.test.ts:38` `"windowposition.x": "100",`
- `tests/balloon-descript/all-properties/mock-props.ts:20` `"windowposition.x": "100",`
- `tests/balloon-descript-layout/position.test.ts:37` `"windowposition.x": "100",`
