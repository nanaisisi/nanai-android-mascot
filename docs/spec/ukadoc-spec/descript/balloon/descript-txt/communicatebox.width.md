# communicatebox.width,サイズ

- **規格**: [communicatebox.width.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/) (ukadoc-spec/descript/balloon/descript-txt/communicatebox.width.md)
- **検索語**: communicatebox.width
- **対応状況**: ✅ 対応済

## 突合結果

`app-actions.js` の `applyBalloonDescript()` において `props["communicatebox.width"]` を取得し、ドキュメント内の `.communicate-box` 要素の幅（`style.width = \`${cbWidth}px\``）として動的に反映される実装が行われている。


## 実装箇所

- `ui/js/core/actions/balloon-descript/layout.js:27` `// [communicatebox.width,サイズ], [communicatebox.height,サイズ], [communicatebox.x,座標`
- `ui/js/core/actions/balloon-descript/layout.js:29` `const cbWidth = props["communicatebox.width"];`
- `tests/balloon-descript.test.js:60` `"communicatebox.width": "200",`
