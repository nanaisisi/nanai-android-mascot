# sstpmessage.y,座標

- **規格**: [sstpmessage.y.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/) (ukadoc-spec/descript/balloon/descript-txt/sstpmessage.y.md)
- **検索語**: sstpmessage.y
- **対応状況**: ✅ 実装済

## 突合結果

`ui/js/core/actions/balloon-descript/layout.js` の `applyLayoutProperties()` において `props["sstpmessage.y"]` をパースし、`--balloon-sstpmessage-y` カスタムプロパティへ反映する実装が行われている。

## 実装箇所

- `ui/ts/core/actions/balloon-descript/assets.ts:251` `// [sstpmessage.x,座標], [sstpmessage.y,座標]:`
- `ui/ts/core/actions/balloon-descript/assets.ts:253` `const sstpMsgY = parseInt(props["sstpmessage.y"], 10);`
- `ui/ts/core/actions/balloon-descript/layout/position.ts:35` `// [sstpmessage.x,座標], [sstpmessage.y,座標], [sstpmessage.xr,座標], [sstpmessage.yb,`
- `ui/ts/core/actions/balloon-descript/layout/position.ts:37` `const sstpY = parseInt(props["sstpmessage.y"], 10);`
- `tests/balloon-descript/all-properties/mock-props.ts:83` `"sstpmessage.y": "40",`
