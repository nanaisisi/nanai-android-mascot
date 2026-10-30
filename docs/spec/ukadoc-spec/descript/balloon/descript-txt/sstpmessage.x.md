# sstpmessage.x,座標

- **規格**: [sstpmessage.x.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/) (ukadoc-spec/descript/balloon/descript-txt/sstpmessage.x.md)
- **検索語**: sstpmessage.x
- **対応状況**: ✅ 対応済

## 突合結果

`ui/js/core/actions/balloon-descript/layout.js` の `applyLayoutProperties()` において `props["sstpmessage.x"]` をパースし、`--balloon-sstpmessage-x` カスタムプロパティへ反映する実装が行われている。

## 実装箇所

- `ui/js/core/actions/balloon-descript/assets.js:113` `// [sstpmessage.x,座標], [sstpmessage.y,座標]:`
- `ui/js/core/actions/balloon-descript/assets.js:114` `const sstpMsgX = parseInt(props["sstpmessage.x"], 10);`
- `ui/js/core/actions/balloon-descript/layout.js:145` `// [sstpmessage.x,座標], [sstpmessage.y,座標], [sstpmessage.xr,座標], [sstpmessage.yb,`
- `ui/js/core/actions/balloon-descript/layout.js:146` `const sstpX = parseInt(props["sstpmessage.x"], 10);`
- `ui/js/core/actions/balloon-descript/layout.js:148` `const sstpXR = parseInt(props["sstpmessage.xr"], 10);`
