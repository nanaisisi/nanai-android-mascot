# number.x,座標

- **規格**: [number.x.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/) (ukadoc-spec/descript/balloon/descript-txt/number.x.md)
- **検索語**: number.x
- **対応状況**: ✅ 実装済

## 突合結果

`ui/js/core/actions/balloon-descript/layout.js` の `applyLayoutProperties()` において `props["number.x"]` をパースし、`--balloon-number-x` カスタムプロパティへ反映する実装が行われている。

## 実装箇所

- `ui/ts/core/actions/balloon-descript/layout/position.ts:21` `// [number.x,座標], [number.y,座標], [number.xr,座標], [number.yb,座標]:`
- `ui/ts/core/actions/balloon-descript/layout/position.ts:22` `const numX = parseInt(props["number.x"], 10);`
- `tests/balloon-descript/all-properties/mock-props.ts:71` `"number.x": "10",`
- `tests/balloon-descript-layout/position.test.ts:29` `"number.x": "8",`
