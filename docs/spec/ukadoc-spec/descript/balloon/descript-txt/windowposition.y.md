# windowposition.y,座標

- **規格**: [windowposition.y.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/) (ukadoc-spec/descript/balloon/descript-txt/windowposition.y.md)
- **検索語**: windowposition.y
- **対応状況**: ✅ 対応済

## 突合結果

`ui/js/core/actions/balloon-descript/layout.js` の `applyLayoutProperties()` において `props["windowposition.y"]` をパースし、`--balloon-windowpos-y` カスタムプロパティへ反映する実装が行われている。

## 実装箇所

- `ui/js/core/actions/balloon-descript/layout.js` `if (!Number.isNaN(wpY)) root.style.setProperty("--balloon-windowpos-y", \`${wpY}px\`);`
