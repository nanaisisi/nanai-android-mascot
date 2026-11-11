# communicatebox.x,座標

- **規格**: [communicatebox.x.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/) (ukadoc-spec/descript/balloon/descript-txt/communicatebox.x.md)
- **検索語**: communicatebox.x
- **対応状況**: ✅ 実装済

## 突合結果

`ui/js/core/actions/balloon-descript/layout.js` の `applyLayoutProperties()` において `props["communicatebox.x"]` をパースし、`.communicate-box` DOM の `left` 位置へ反映する実装が行われている。

## 実装箇所

- `ui/ts/core/actions/balloon-descript/layout/communicate-box.ts:8` `// [communicatebox.width,サイズ], [communicatebox.height,サイズ], [communicatebox.x,座標`
- `ui/ts/core/actions/balloon-descript/layout/communicate-box.ts:12` `const cbX = props["communicatebox.x"];`
- `tests/balloon-descript/all-properties/mock-props.ts:5` `"communicatebox.x": "10",`
- `tests/balloon-descript-layout/communicate-box.test.ts:53` `"communicatebox.x": "12",`
