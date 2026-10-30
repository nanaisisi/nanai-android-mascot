# number.y,座標

- **規格**: [number.y.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/) (ukadoc-spec/descript/balloon/descript-txt/number.y.md)
- **検索語**: number.y
- **対応状況**: ✅ 対応済

## 突合結果

`ui/js/core/actions/balloon-descript/layout.js` の `applyLayoutProperties()` において `props["number.y"]` をパースし、`--balloon-number-y` カスタムプロパティへ反映する実装が行われている。

## 実装箇所

- `ui/js/core/actions/balloon-descript/layout.js:135` `// [number.x,座標], [number.y,座標], [number.xr,座標], [number.yb,座標]:`
- `ui/js/core/actions/balloon-descript/layout.js:137` `const numY = parseInt(props["number.y"], 10);`
- `ui/js/core/actions/balloon-descript/layout.js:139` `const numYB = parseInt(props["number.yb"], 10);`
- `tests/balloon-descript.test.js:109` `"number.y": "20",`
- `tests/balloon-descript.test.js:111` `"number.yb": "-20",`
