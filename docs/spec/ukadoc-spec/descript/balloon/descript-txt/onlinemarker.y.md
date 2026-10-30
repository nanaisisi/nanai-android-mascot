# onlinemarker.y,座標

- **規格**: [onlinemarker.y.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/) (ukadoc-spec/descript/balloon/descript-txt/onlinemarker.y.md)
- **検索語**: onlinemarker.y
- **対応状況**: ✅ 対応済

## 突合結果

`ui/js/core/actions/balloon-descript/assets.js` の `applyAssetProperties()` において `props["onlinemarker.y"]` をパースし、`--balloon-online-y` カスタムプロパティへ反映する実装が行われている。

## 実装箇所

- `ui/js/core/actions/balloon-descript/assets.js:108` `// [onlinemarker.interval,待機時間], [onlinemarker.x,座標], [onlinemarker.y,座標]:`
- `ui/js/core/actions/balloon-descript/assets.js:113` `const onlineY = parseInt(props["onlinemarker.y"], 10);`
