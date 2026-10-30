# wordwrappoint.y,座標

- **規格**: [wordwrappoint.y.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/) (ukadoc-spec/descript/balloon/descript-txt/wordwrappoint.y.md)
- **検索語**: wordwrappoint.y
- **対応状況**: ✅ 対応済

## 突合結果

`ui/js/core/actions/balloon-descript/layout.js` の `applyLayoutProperties()` において `props["wordwrappoint.y"]` をパースし、バルーン DOM (`.balloon`) の `maxHeight` スタイルへ動的適用する実装が行われている。

## 実装箇所

- `ui/js/core/actions/balloon-descript/layout.js:104` `// [wordwrappoint.x,座標], [wordwrappoint.y,座標]:`
- `ui/js/core/actions/balloon-descript/layout.js:115` `const wwY = parseInt(props["wordwrappoint.y"], 10);`
- `tests/balloon-descript.test.js:74` `"wordwrappoint.y": "150",`
