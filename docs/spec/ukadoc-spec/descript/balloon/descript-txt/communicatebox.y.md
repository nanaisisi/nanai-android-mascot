# communicatebox.y,座標

- **規格**: [communicatebox.y.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/) (ukadoc-spec/descript/balloon/descript-txt/communicatebox.y.md)
- **検索語**: communicatebox.y
- **対応状況**: ✅ 対応済

## 突合結果

`ui/js/core/actions/balloon-descript/layout.js` の `applyLayoutProperties()` において `props["communicatebox.y"]` をパースし、`.communicate-box` DOM の `top` 位置へ反映する実装が行われている。

## 実装箇所

- `ui/js/core/actions/balloon-descript/layout.js:27` `// [communicatebox.width,サイズ], [communicatebox.height,サイズ], [communicatebox.x,座標`
- `ui/js/core/actions/balloon-descript/layout.js:32` `const cbY = props["communicatebox.y"];`
- `tests/balloon-descript.test.js:63` `"communicatebox.y": "10",`
