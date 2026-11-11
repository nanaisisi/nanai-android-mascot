# sstpmessage.x,座標

- **規格**: [sstpmessage.x.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/) (ukadoc-spec/descript/balloon/descript-txt/sstpmessage.x.md)
- **検索語**: sstpmessage.x
- **対応状況**: ✅ 実装済

## 突合結果

`ui/js/core/actions/balloon-descript/layout.js` の `applyLayoutProperties()` において `props["sstpmessage.x"]` をパースし、`--balloon-sstpmessage-x` カスタムプロパティへ反映する実装が行われている。

## 実装箇所

- `ui/ts/core/actions/balloon-descript/assets.ts:251` `// [sstpmessage.x,座標], [sstpmessage.y,座標]:`
- `ui/ts/core/actions/balloon-descript/assets.ts:252` `const sstpMsgX = parseInt(props["sstpmessage.x"], 10);`
- `ui/ts/core/actions/balloon-descript/layout/position.ts:35` `// [sstpmessage.x,座標], [sstpmessage.y,座標], [sstpmessage.xr,座標], [sstpmessage.yb,`
- `ui/ts/core/actions/balloon-descript/layout/position.ts:36` `const sstpX = parseInt(props["sstpmessage.x"], 10);`
- `tests/balloon-descript/all-properties/mock-props.ts:82` `"sstpmessage.x": "30",`
