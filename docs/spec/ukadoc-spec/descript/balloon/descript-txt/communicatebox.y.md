# communicatebox.y,座標

- **規格**: [communicatebox.y.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/) (ukadoc-spec/descript/balloon/descript-txt/communicatebox.y.md)
- **検索語**: communicatebox.y
- **対応状況**: ✅ 実装済

## 突合結果

`ui/js/core/actions/balloon-descript/layout.js` の `applyLayoutProperties()` において `props["communicatebox.y"]` をパースし、`.communicate-box` DOM の `top` 位置へ反映する実装が行われている。

## 実装箇所

- `ui/ts/core/actions/balloon-descript/layout/communicate-box.ts:8` `// [communicatebox.width,サイズ], [communicatebox.height,サイズ], [communicatebox.x,座標`
- `ui/ts/core/actions/balloon-descript/layout/communicate-box.ts:13` `const cbY = props["communicatebox.y"];`
- `tests/balloon-descript/all-properties/mock-props.ts:6` `"communicatebox.y": "10",`
- `tests/balloon-descript-layout/communicate-box.test.ts:54` `"communicatebox.y": "24",`
