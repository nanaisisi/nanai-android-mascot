# arrow0.x,座標

- **規格**: [arrow0.x.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/) (ukadoc-spec/descript/balloon/descript-txt/arrow0.x.md)
- **検索語**: arrow0.x
- **対応状況**: ✅ 対応済

## 突合結果

`ui/js/core/actions/balloon-descript/assets.js` の `applyAssetProperties()` において `props["arrow0.x"]` をパースし、`--balloon-arrow0-x` カスタムプロパティへ反映する実装が行われている。

## 実装箇所

- `ui/js/core/actions/balloon-descript/assets.js` `if (!Number.isNaN(arrow0x)) root.style.setProperty("--balloon-arrow0-x", \`${arrow0x}px\`);`
