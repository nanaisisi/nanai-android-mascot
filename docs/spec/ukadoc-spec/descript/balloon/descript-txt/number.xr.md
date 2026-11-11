# number.xr,座標

- **規格**: [number.xr.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/) (ukadoc-spec/descript/balloon/descript-txt/number.xr.md)
- **検索語**: number.xr
- **対応状況**: ✅ 実装済

## 突合結果

`ui/js/core/actions/balloon-descript/layout.js` の `applyLayoutProperties()` において `props["number.xr"]` をパースし、`--balloon-number-xr` カスタムプロパティへ反映する実装が行われている。

## 実装箇所

- `ui/ts/core/actions/balloon-descript/layout/position.ts:21` `// [number.x,座標], [number.y,座標], [number.xr,座標], [number.yb,座標]:`
- `ui/ts/core/actions/balloon-descript/layout/position.ts:24` `const numXR = parseInt(props["number.xr"], 10);`
- `tests/balloon-descript/all-properties/mock-props.ts:73` `"number.xr": "-10",`
- `tests/balloon-descript-layout/position.test.ts:31` `"number.xr": "-8",`
