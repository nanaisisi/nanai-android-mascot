# arrow1.x,座標

- **規格**: [arrow1.x.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/) (ukadoc-spec/descript/balloon/descript-txt/arrow1.x.md)
- **検索語**: arrow1.x
- **対応状況**: ✅ 対応済

## 突合結果

`ui/js/core/actions/balloon-descript/assets.js` の `applyAssetProperties()` において `props["arrow1.x"]` をパースし、`--balloon-arrow1-x` カスタムプロパティへ反映する実装が行われている。

## 実装箇所

- `ui/js/core/actions/balloon-descript/assets.js:63` `// [arrow0.x,座標], [arrow0.y,座標], [arrow1.x,座標], [arrow1.y,座標]:`
- `ui/js/core/actions/balloon-descript/assets.js:71` `const arrow1x = parseInt(props["arrow1.x"], 10);`
