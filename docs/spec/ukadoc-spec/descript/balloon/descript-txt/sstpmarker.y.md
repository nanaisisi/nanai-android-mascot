# sstpmarker.y,座標

- **規格**: [sstpmarker.y.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/) (ukadoc-spec/descript/balloon/descript-txt/sstpmarker.y.md)
- **検索語**: sstpmarker.y
- **対応状況**: ✅ 対応済

## 突合結果

`ui/js/core/actions/balloon-descript/assets.js` の `applyAssetProperties()` において `props["sstpmarker.y"]` をパースし、`--balloon-sstpmarker-y` カスタムプロパティへ反映する実装が行われている。

## 実装箇所

- `ui/js/core/actions/balloon-descript/assets.js:86` `// [sstpmarker.x,座標], [sstpmarker.y,座標]:`
- `ui/js/core/actions/balloon-descript/assets.js:88` `const smY = parseInt(props["sstpmarker.y"], 10);`
- `tests/balloon-descript.test.js:118` `"sstpmarker.y": "25",`
