# windowposition.x,座標

- **規格**: [windowposition.x.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/) (ukadoc-spec/descript/balloon/descript-txt/windowposition.x.md)
- **検索語**: windowposition.x
- **対応状況**: ✅ 対応済

## 突合結果

`ui/js/core/actions/balloon-descript/layout.js` の `applyLayoutProperties()` において `props["windowposition.x"]` をパースし、`--balloon-windowpos-x` カスタムプロパティへ反映する実装が行われている。

## 実装箇所

- `ui/js/core/actions/balloon-descript/layout.js:155` `// [windowposition.x,座標], [windowposition.y,座標], [windowposition.limit,0/1]:`
- `ui/js/core/actions/balloon-descript/layout.js:156` `const wpX = parseInt(props["windowposition.x"], 10);`
- `tests/balloon-descript.test.js:71` `"windowposition.x": "100",`
- `tests/frontend-coverage-boost.test.js:38` `"windowposition.x": "100",`
