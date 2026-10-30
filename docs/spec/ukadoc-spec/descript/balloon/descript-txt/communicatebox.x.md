# communicatebox.x,座標

- **規格**: [communicatebox.x.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/) (ukadoc-spec/descript/balloon/descript-txt/communicatebox.x.md)
- **検索語**: communicatebox.x
- **対応状況**: ✅ 対応済

## 突合結果

`ui/js/core/actions/balloon-descript/layout.js` の `applyLayoutProperties()` において `props["communicatebox.x"]` をパースし、`.communicate-box` DOM の `left` 位置へ反映する実装が行われている。

## 実装箇所

- `ui/js/core/actions/balloon-descript/layout.js:27` `// [communicatebox.width,サイズ], [communicatebox.height,サイズ], [communicatebox.x,座標`
- `ui/js/core/actions/balloon-descript/layout.js:31` `const cbX = props["communicatebox.x"];`
- `tests/balloon-descript.test.js:62` `"communicatebox.x": "10",`
