# sstpmarker.x,座標

- **規格**: [sstpmarker.x.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/) (ukadoc-spec/descript/balloon/descript-txt/sstpmarker.x.md)
- **検索語**: sstpmarker.x
- **対応状況**: ✅ 対応済

## 突合結果

`ui/js/core/actions/balloon-descript/assets.js` の `applyAssetProperties()` において `props["sstpmarker.x"]` をパースし、`--balloon-sstpmarker-x` カスタムプロパティへ反映する実装が行われている。

## 実装箇所

- `ui/js/core/actions/balloon-descript/assets.js:92` `// [sstpmarker.x,座標], [sstpmarker.y,座標]:`
- `ui/js/core/actions/balloon-descript/assets.js:93` `const smX = parseInt(props["sstpmarker.x"], 10);`
