# onlinemarker.interval,待機時間

- **規格**: [onlinemarker.interval.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/) (ukadoc-spec/descript/balloon/descript-txt/onlinemarker.interval.md)
- **検索語**: onlinemarker.interval
- **対応状況**: ✅ 実装済

## 突合結果

`ui/js/core/actions/balloon-descript/assets.js` の `applyAssetProperties()` において `props["onlinemarker.interval"]` をパースし、`instance.onlineMarkerInterval` へ反映する実装が行われている。

## 実装箇所

- `ui/ts/core/actions/balloon-descript/assets.ts:240` `// [onlinemarker.interval,待機時間], [onlinemarker.x,座標], [onlinemarker.y,座標]:`
- `ui/ts/core/actions/balloon-descript/assets.ts:241` `const onlineInterval = parseInt(props["onlinemarker.interval"], 10);`
- `tests/balloon-descript/all-properties/mock-props.ts:93` `"onlinemarker.interval": "5000",`
- `tests/core-coverage-boost/balloon-descript-coverage.test.ts:126` `"onlinemarker.interval": "500",`
