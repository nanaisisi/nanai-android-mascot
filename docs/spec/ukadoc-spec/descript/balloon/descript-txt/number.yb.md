# number.yb,座標

- **規格**: [number.yb.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/) (ukadoc-spec/descript/balloon/descript-txt/number.yb.md)
- **検索語**: number.yb
- **対応状況**: ✅ 実装済

## 突合結果

`ui/js/core/actions/balloon-descript/layout.js` の `applyLayoutProperties()` において `props["number.yb"]` をパースし、`--balloon-number-yb` カスタムプロパティへ反映する実装が行われている。

## 実装箇所

- `ui/ts/core/actions/balloon-descript/layout/position.ts:21` `// [number.x,座標], [number.y,座標], [number.xr,座標], [number.yb,座標]:`
- `ui/ts/core/actions/balloon-descript/layout/position.ts:25` `const numYB = parseInt(props["number.yb"], 10);`
- `tests/balloon-descript/all-properties/mock-props.ts:74` `"number.yb": "-20",`
- `tests/balloon-descript-layout/position.test.ts:32` `"number.yb": "-16",`
