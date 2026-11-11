# onlinemarker.x,座標

- **規格**: [onlinemarker.x.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/) (ukadoc-spec/descript/balloon/descript-txt/onlinemarker.x.md)
- **検索語**: onlinemarker.x
- **対応状況**: ✅ 実装済

## 突合結果

`ui/js/core/actions/balloon-descript/assets.js` の `applyAssetProperties()` において `props["onlinemarker.x"]` をパースし、`--balloon-online-x` カスタムプロパティへ反映する実装が行われている。

## 実装箇所

- `ui/ts/core/actions/balloon-descript/assets.ts:240` `// [onlinemarker.interval,待機時間], [onlinemarker.x,座標], [onlinemarker.y,座標]:`
- `ui/ts/core/actions/balloon-descript/assets.ts:244` `const onlineX = parseInt(props["onlinemarker.x"], 10);`
- `tests/core-coverage-boost/balloon-descript-coverage.test.ts:127` `"onlinemarker.x": "15",`
