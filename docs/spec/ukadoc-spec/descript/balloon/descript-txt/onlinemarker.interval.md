# onlinemarker.interval,待機時間

- **規格**: [onlinemarker.interval.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/) (ukadoc-spec/descript/balloon/descript-txt/onlinemarker.interval.md)
- **検索語**: onlinemarker.interval
- **対応状況**: ✅ 対応済

## 突合結果

`ui/js/core/actions/balloon-descript/assets.js` の `applyAssetProperties()` において `props["onlinemarker.interval"]` をパースし、`instance.onlineMarkerInterval` へ反映する実装が行われている。

## 実装箇所

- `ui/js/core/actions/balloon-descript/assets.js:102` `// [onlinemarker.interval,待機時間], [onlinemarker.x,座標], [onlinemarker.y,座標]:`
- `ui/js/core/actions/balloon-descript/assets.js:103` `const onlineInterval = parseInt(props["onlinemarker.interval"], 10);`
- `tests/balloon-descript.test.js:129` `"onlinemarker.interval": "5000",`
