# sstpmarker.x,座標

- **規格**: [sstpmarker.x.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/) (ukadoc-spec/descript/balloon/descript-txt/sstpmarker.x.md)
- **検索語**: sstpmarker.x
- **対応状況**: ✅ 実装済

## 突合結果

`ui/js/core/actions/balloon-descript/assets.js` の `applyAssetProperties()` において `props["sstpmarker.x"]` をパースし、`--balloon-sstpmarker-x` カスタムプロパティへ反映する実装が行われている。

## 実装箇所

- `ui/ts/core/actions/balloon-descript/assets.ts:224` `// [sstpmarker.x,座標], [sstpmarker.y,座標]:`
- `ui/ts/core/actions/balloon-descript/assets.ts:225` `const smX = parseInt(props["sstpmarker.x"], 10);`
- `tests/balloon-descript/all-properties/mock-props.ts:80` `"sstpmarker.x": "15",`
- `tests/core-coverage-boost/balloon-descript-coverage.test.ts:123` `"sstpmarker.x": "7",`
- `tests/sstp-fmo/balloon-styling.test.ts:36` `"sstpmarker.x": "5",`
