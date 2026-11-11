# onlinemarker.y,座標

- **規格**: [onlinemarker.y.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/) (ukadoc-spec/descript/balloon/descript-txt/onlinemarker.y.md)
- **検索語**: onlinemarker.y
- **対応状況**: ✅ 実装済

## 突合結果

`ui/js/core/actions/balloon-descript/assets.js` の `applyAssetProperties()` において `props["onlinemarker.y"]` をパースし、`--balloon-online-y` カスタムプロパティへ反映する実装が行われている。

## 実装箇所

- `ui/ts/core/actions/balloon-descript/assets.ts:240` `// [onlinemarker.interval,待機時間], [onlinemarker.x,座標], [onlinemarker.y,座標]:`
- `ui/ts/core/actions/balloon-descript/assets.ts:245` `const onlineY = parseInt(props["onlinemarker.y"], 10);`
- `tests/core-coverage-boost/balloon-descript-coverage.test.ts:128` `"onlinemarker.y": "25",`
