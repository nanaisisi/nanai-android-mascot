# windowposition.x,座標

- **規格**: [windowposition.x.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/) (ukadoc-spec/descript/balloon/descript-txt/windowposition.x.md)
- **検索語**: windowposition.x
- **対応状況**: ✅ 対応済

## 突合結果

`ui/js/core/actions/balloon-descript/layout.js` の `applyLayoutProperties()` において `props["windowposition.x"]` をパースし、`--balloon-windowpos-x` カスタムプロパティへ反映する実装が行われている。

## 実装箇所

- `ui/js/core/actions/balloon-descript/layout.js` `if (!Number.isNaN(wpX)) root.style.setProperty("--balloon-windowpos-x", \`${wpX}px\`);`
