# sstpmessage.xr,座標

- **規格**: [sstpmessage.xr.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/) (ukadoc-spec/descript/balloon/descript-txt/sstpmessage.xr.md)
- **検索語**: sstpmessage.xr
- **対応状況**: ✅ 対応済

## 突合結果

`ui/js/core/actions/balloon-descript/layout.js` の `applyLayoutProperties()` において `props["sstpmessage.xr"]` をパースし、`--balloon-sstpmessage-xr` カスタムプロパティへ反映する実装が行われている。

## 実装箇所

- `ui/js/core/actions/balloon-descript/layout.js:149` `// [sstpmessage.x,座標], [sstpmessage.y,座標], [sstpmessage.xr,座標], [sstpmessage.yb,`
- `ui/js/core/actions/balloon-descript/layout.js:152` `const sstpXR = parseInt(props["sstpmessage.xr"], 10);`
