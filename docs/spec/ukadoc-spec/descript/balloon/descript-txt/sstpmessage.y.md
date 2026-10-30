# sstpmessage.y,座標

- **規格**: [sstpmessage.y.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/) (ukadoc-spec/descript/balloon/descript-txt/sstpmessage.y.md)
- **検索語**: sstpmessage.y
- **対応状況**: ✅ 対応済

## 突合結果

`ui/js/core/actions/balloon-descript/layout.js` の `applyLayoutProperties()` において `props["sstpmessage.y"]` をパースし、`--balloon-sstpmessage-y` カスタムプロパティへ反映する実装が行われている。

## 実装箇所

- `ui/js/core/actions/balloon-descript/assets.js:113` `// [sstpmessage.x,座標], [sstpmessage.y,座標]:`
- `ui/js/core/actions/balloon-descript/assets.js:115` `const sstpMsgY = parseInt(props["sstpmessage.y"], 10);`
- `ui/js/core/actions/balloon-descript/layout.js:145` `// [sstpmessage.x,座標], [sstpmessage.y,座標], [sstpmessage.xr,座標], [sstpmessage.yb,`
- `ui/js/core/actions/balloon-descript/layout.js:147` `const sstpY = parseInt(props["sstpmessage.y"], 10);`
- `ui/js/core/actions/balloon-descript/layout.js:149` `const sstpYB = parseInt(props["sstpmessage.yb"], 10);`
