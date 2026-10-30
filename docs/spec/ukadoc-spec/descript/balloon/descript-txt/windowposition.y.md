# windowposition.y,座標

- **規格**: [windowposition.y.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/) (ukadoc-spec/descript/balloon/descript-txt/windowposition.y.md)
- **検索語**: windowposition.y
- **対応状況**: ✅ 対応済

## 突合結果

`ui/js/core/actions/balloon-descript/layout.js` の `applyLayoutProperties()` において `props["windowposition.y"]` をパースし、`--balloon-windowpos-y` カスタムプロパティへ反映する実装が行われている。

## 実装箇所

- `ui/js/core/actions/balloon-descript/layout.js:163` `// [windowposition.x,座標], [windowposition.y,座標], [windowposition.limit,0/1]:`
- `ui/js/core/actions/balloon-descript/layout.js:165` `const wpY = parseInt(props["windowposition.y"], 10);`
- `tests/balloon-descript.test.js:78` `"windowposition.y": "200",`
- `tests/frontend-coverage-boost.test.js:39` `"windowposition.y": "200",`
