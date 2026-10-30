# onlinemarker.x,座標

- **規格**: [onlinemarker.x.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/) (ukadoc-spec/descript/balloon/descript-txt/onlinemarker.x.md)
- **検索語**: onlinemarker.x
- **対応状況**: ✅ 対応済

## 突合結果

`ui/js/core/actions/balloon-descript/assets.js` の `applyAssetProperties()` において `props["onlinemarker.x"]` をパースし、`--balloon-online-x` カスタムプロパティへ反映する実装が行われている。

## 実装箇所

- `ui/js/core/actions/balloon-descript/assets.js:108` `// [onlinemarker.interval,待機時間], [onlinemarker.x,座標], [onlinemarker.y,座標]:`
- `ui/js/core/actions/balloon-descript/assets.js:112` `const onlineX = parseInt(props["onlinemarker.x"], 10);`
