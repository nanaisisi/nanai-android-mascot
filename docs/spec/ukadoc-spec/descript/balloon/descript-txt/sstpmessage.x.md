# sstpmessage.x,座標

- **規格**: [sstpmessage.x.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/) (ukadoc-spec/descript/balloon/descript-txt/sstpmessage.x.md)
- **検索語**: sstpmessage.x
- **対応状況**: ✅ 対応済

## 突合結果

`ui/js/core/actions/balloon-descript/layout.js` の `applyLayoutProperties()` において `props["sstpmessage.x"]` をパースし、`--balloon-sstpmessage-x` カスタムプロパティへ反映する実装が行われている。

## 実装箇所

- `ui/js/core/actions/balloon-descript/layout.js` `if (!Number.isNaN(sstpX)) root.style.setProperty("--balloon-sstpmessage-x", \`${sstpX}px\`);`
