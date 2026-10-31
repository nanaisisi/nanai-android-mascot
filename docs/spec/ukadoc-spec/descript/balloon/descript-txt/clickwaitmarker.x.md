# clickwaitmarker.x,座標

- **規格**: [clickwaitmarker.x.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/) (ukadoc-spec/descript/balloon/descript-txt/clickwaitmarker.x.md)
- **検索語**: clickwaitmarker.x
- **対応状況**: ✅ 対応済

## 突合結果

`ui/js/core/actions/balloon-descript/assets.js` の `applyAssetProperties()` において `props["clickwaitmarker.x"]` をパースし、`--balloon-clickwait-x` カスタムプロパティへ反映する実装が行われている。

## 実装箇所

- `ui/js/core/actions/balloon-descript/assets.js:84` `// [clickwaitmarker.x,座標], [clickwaitmarker.y,座標]:`
- `ui/js/core/actions/balloon-descript/assets.js:85` `const cwX = parseInt(props["clickwaitmarker.x"], 10);`
