# clickwaitmarker.x,座標

- **規格**: [clickwaitmarker.x.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/) (ukadoc-spec/descript/balloon/descript-txt/clickwaitmarker.x.md)
- **検索語**: clickwaitmarker.x
- **対応状況**: ✅ 実装済

## 突合結果

`ui/js/core/actions/balloon-descript/assets.js` の `applyAssetProperties()` において `props["clickwaitmarker.x"]` をパースし、`--balloon-clickwait-x` カスタムプロパティへ反映する実装が行われている。

## 実装箇所

- `ui/ts/core/actions/balloon-descript/assets.ts:216` `// [clickwaitmarker.x,座標], [clickwaitmarker.y,座標]:`
- `ui/ts/core/actions/balloon-descript/assets.ts:217` `const cwX = parseInt(props["clickwaitmarker.x"], 10);`
- `tests/frontend-coverage-boost.test.ts:35` `"clickwaitmarker.x": "50",`
- `tests/core-coverage-boost/balloon-descript-coverage.test.ts:120` `"clickwaitmarker.x": "5",`
