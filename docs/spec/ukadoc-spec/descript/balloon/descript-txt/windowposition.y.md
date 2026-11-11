# windowposition.y,座標

- **規格**: [windowposition.y.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/) (ukadoc-spec/descript/balloon/descript-txt/windowposition.y.md)
- **検索語**: windowposition.y
- **対応状況**: ✅ 実装済

## 突合結果

`ui/js/core/actions/balloon-descript/layout.js` の `applyLayoutProperties()` において `props["windowposition.y"]` をパースし、`--balloon-windowpos-y` カスタムプロパティへ反映する実装が行われている。

## 実装箇所

- `ui/ts/core/actions/balloon-descript/layout/position.ts:49` `// [windowposition.x,座標], [windowposition.y,座標], [windowposition.limit,0/1]:`
- `ui/ts/core/actions/balloon-descript/layout/position.ts:51` `const wpY = parseInt(props["windowposition.y"], 10);`
- `tests/frontend-coverage-boost.test.ts:39` `"windowposition.y": "200",`
- `tests/balloon-descript/all-properties/mock-props.ts:21` `"windowposition.y": "200",`
- `tests/balloon-descript-layout/position.test.ts:38` `"windowposition.y": "200",`
