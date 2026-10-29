# clickwaitmarker.y,座標

- **規格**: [clickwaitmarker.y.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/) (ukadoc-spec/descript/balloon/descript-txt/clickwaitmarker.y.md)
- **検索語**: clickwaitmarker.y
- **対応状況**: ✅ 対応済

## 突合結果

`ui/js/core/actions/balloon-descript/assets.js` の `applyAssetProperties()` において `props["clickwaitmarker.y"]` をパースし、`--balloon-clickwait-y` カスタムプロパティへ反映する実装が行われている。

## 実装箇所

- `ui/js/core/actions/balloon-descript/assets.js` `if (!Number.isNaN(cwY)) root.style.setProperty("--balloon-clickwait-y", \`${cwY}px\`);`
