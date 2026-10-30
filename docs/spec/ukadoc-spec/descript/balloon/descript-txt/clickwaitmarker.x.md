# clickwaitmarker.x,座標

- **規格**: [clickwaitmarker.x.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/) (ukadoc-spec/descript/balloon/descript-txt/clickwaitmarker.x.md)
- **検索語**: clickwaitmarker.x
- **対応状況**: ✅ 対応済

## 突合結果

`ui/js/core/actions/balloon-descript/assets.js` の `applyAssetProperties()` において `props["clickwaitmarker.x"]` をパースし、`--balloon-clickwait-x` カスタムプロパティへ反映する実装が行われている。

## 実装箇所

- `ui/js/core/actions/balloon-descript/assets.js:78` `// [clickwaitmarker.x,座標], [clickwaitmarker.y,座標]:`
- `ui/js/core/actions/balloon-descript/assets.js:79` `const cwX = parseInt(props["clickwaitmarker.x"], 10);`
- `tests/frontend-coverage-boost.test.js:35` `"clickwaitmarker.x": "50",`
