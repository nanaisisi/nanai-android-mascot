# wordwrappoint.y,座標

- **規格**: [wordwrappoint.y.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/) (ukadoc-spec/descript/balloon/descript-txt/wordwrappoint.y.md)
- **検索語**: wordwrappoint.y
- **対応状況**: ✅ 実装済

## 突合結果

`ui/js/core/actions/balloon-descript/layout.js` の `applyLayoutProperties()` において `props["wordwrappoint.y"]` をパースし、バルーン DOM (`.balloon`) の `maxHeight` スタイルへ動的適用する実装が行われている。

## 実装箇所

- `ui/ts/core/actions/balloon-descript/layout/rect.ts:47` `// [wordwrappoint.x,座標], [wordwrappoint.y,座標]:`
- `ui/ts/core/actions/balloon-descript/layout/rect.ts:59` `const wwY = parseInt(props["wordwrappoint.y"], 10);`
- `tests/balloon-descript/all-properties/mock-props.ts:17` `"wordwrappoint.y": "150",`
- `tests/balloon-descript-layout/rect.test.ts:43` `"wordwrappoint.y": "250",`
- `tests/balloon-descript-layout/rect.test.ts:70` `"wordwrappoint.y": "10",`
