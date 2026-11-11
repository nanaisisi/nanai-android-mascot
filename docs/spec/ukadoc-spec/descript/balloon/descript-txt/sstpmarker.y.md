# sstpmarker.y,座標

- **規格**: [sstpmarker.y.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/) (ukadoc-spec/descript/balloon/descript-txt/sstpmarker.y.md)
- **検索語**: sstpmarker.y
- **対応状況**: ✅ 実装済

## 突合結果

`ui/js/core/actions/balloon-descript/assets.js` の `applyAssetProperties()` において `props["sstpmarker.y"]` をパースし、`--balloon-sstpmarker-y` カスタムプロパティへ反映する実装が行われている。

## 実装箇所

- `ui/ts/core/actions/balloon-descript/assets.ts:224` `// [sstpmarker.x,座標], [sstpmarker.y,座標]:`
- `ui/ts/core/actions/balloon-descript/assets.ts:226` `const smY = parseInt(props["sstpmarker.y"], 10);`
- `tests/balloon-descript/all-properties/mock-props.ts:81` `"sstpmarker.y": "25",`
- `tests/core-coverage-boost/balloon-descript-coverage.test.ts:124` `"sstpmarker.y": "8",`
- `tests/sstp-fmo/balloon-styling.test.ts:37` `"sstpmarker.y": "10",`
