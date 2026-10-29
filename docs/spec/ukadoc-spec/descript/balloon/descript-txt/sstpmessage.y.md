# sstpmessage.y,座標

- **規格**: [sstpmessage.y.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/) (ukadoc-spec/descript/balloon/descript-txt/sstpmessage.y.md)
- **検索語**: sstpmessage.y
- **対応状況**: ✅ 対応済

## 突合結果

`ui/js/core/actions/balloon-descript/layout.js` の `applyLayoutProperties()` において `props["sstpmessage.y"]` をパースし、`--balloon-sstpmessage-y` カスタムプロパティへ反映する実装が行われている。

## 実装箇所

- `ui/js/core/actions/balloon-descript/layout.js` `if (!Number.isNaN(sstpY)) root.style.setProperty("--balloon-sstpmessage-y", \`${sstpY}px\`);`
