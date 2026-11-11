# arrow0.y,座標

- **規格**: [arrow0.y.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/) (ukadoc-spec/descript/balloon/descript-txt/arrow0.y.md)
- **検索語**: arrow0.y
- **対応状況**: ✅ 実装済

## 突合結果

`ui/js/core/actions/balloon-descript/assets.js` の `applyAssetProperties()` において `props["arrow0.y"]` をパースし、`--balloon-arrow0-y` カスタムプロパティへ反映する実装が行われている。

## 実装箇所

- `ui/ts/core/actions/balloon-descript/assets.ts:201` `// [arrow0.x,座標], [arrow0.y,座標], [arrow1.x,座標], [arrow1.y,座標]:`
- `ui/ts/core/actions/balloon-descript/assets.ts:203` `const arrow0y = parseInt(props["arrow0.y"], 10);`
- `tests/frontend-coverage-boost.test.ts:34` `"arrow0.y": "24",`
- `tests/balloon-descript/all-properties/mock-props.ts:91` `"arrow0.y": "5",`
- `tests/core-coverage-boost/balloon-descript-coverage.test.ts:116` `"arrow0.y": "34",`
