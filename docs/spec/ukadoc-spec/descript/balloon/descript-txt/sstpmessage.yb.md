# sstpmessage.yb,座標

- **規格**: [sstpmessage.yb.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/) (ukadoc-spec/descript/balloon/descript-txt/sstpmessage.yb.md)
- **検索語**: sstpmessage.yb
- **対応状況**: ✅ 対応済

## 突合結果

`ui/js/core/actions/balloon-descript/layout.js` の `applyLayoutProperties()` において `props["sstpmessage.yb"]` をパースし、`--balloon-sstpmessage-yb` カスタムプロパティへ反映する実装が行われている。

## 実装箇所

- `ui/js/core/actions/balloon-descript/layout.js:145` `// [sstpmessage.x,座標], [sstpmessage.y,座標], [sstpmessage.xr,座標], [sstpmessage.yb,`
- `ui/js/core/actions/balloon-descript/layout.js:149` `const sstpYB = parseInt(props["sstpmessage.yb"], 10);`
- `tests/balloon-descript.test.js:122` `"sstpmessage.yb": "-40",`
