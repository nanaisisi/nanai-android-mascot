# communicatebox.width,サイズ

- **規格**: [communicatebox.width.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/) (ukadoc-spec/descript/balloon/descript-txt/communicatebox.width.md)
- **検索語**: communicatebox.width
- **対応状況**: ✅ 実装済

## 突合結果

`app-actions.js` の `applyBalloonDescript()` において `props["communicatebox.width"]` を取得し、ドキュメント内の `.communicate-box` 要素の幅（`style.width = \`${cbWidth}px\``）として動的に反映される実装が行われている。

## 実装箇所

- `ui/ts/core/actions/balloon-descript/layout/communicate-box.ts:8` `// [communicatebox.width,サイズ], [communicatebox.height,サイズ], [communicatebox.x,座標`
- `ui/ts/core/actions/balloon-descript/layout/communicate-box.ts:10` `const cbWidth = props["communicatebox.width"];`
- `tests/balloon-descript/all-properties/mock-props.ts:3` `"communicatebox.width": "200",`
- `tests/balloon-descript-layout/communicate-box.test.ts:51` `"communicatebox.width": "320",`
- `tests/balloon-descript-layout/communicate-box.test.ts:85` `directCommunicateBox({ "communicatebox.width": "100" });`
