# communicatebox.height,サイズ

- **規格**: [communicatebox.height.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/) (ukadoc-spec/descript/balloon/descript-txt/communicatebox.height.md)
- **検索語**: communicatebox.height
- **対応状況**: ✅ 実装済

## 突合結果

`ui/js/core/actions/balloon-descript/layout.js` の `applyLayoutProperties()` において `props["communicatebox.height"]` をパースし、`.communicate-box` DOM の `height` スタイルへ動的適用する実装が行われている。

## 実装箇所

- `ui/ts/core/actions/balloon-descript/layout/communicate-box.ts:8` `// [communicatebox.width,サイズ], [communicatebox.height,サイズ], [communicatebox.x,座標`
- `ui/ts/core/actions/balloon-descript/layout/communicate-box.ts:11` `const cbHeight = props["communicatebox.height"];`
- `tests/balloon-descript/all-properties/mock-props.ts:4` `"communicatebox.height": "30",`
- `tests/balloon-descript-layout/communicate-box.test.ts:52` `"communicatebox.height": "48",`
