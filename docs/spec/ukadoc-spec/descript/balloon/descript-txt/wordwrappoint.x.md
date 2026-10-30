# wordwrappoint.x,座標

- **規格**: [wordwrappoint.x.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/) (ukadoc-spec/descript/balloon/descript-txt/wordwrappoint.x.md)
- **検索語**: wordwrappoint.x
- **対応状況**: ✅ 対応済

## 突合結果

`app-actions.js` の `applyBalloonDescript()` において `props["wordwrappoint.x"]` を数値パースし、ドキュメント内の `.balloon` 要素の最大幅（`style.maxWidth = \`${ww}px\``）として動的適用される実装が行われている。


## 実装箇所

- `ui/js/core/actions/balloon-descript/layout.js:104` `// [wordwrappoint.x,座標], [wordwrappoint.y,座標]:`
- `ui/js/core/actions/balloon-descript/layout.js:105` `if (props["wordwrappoint.x"]) {`
- `ui/js/core/actions/balloon-descript/layout.js:106` `const ww = parseInt(props["wordwrappoint.x"], 10);`
- `ui/js/ghost/balloon-window.js:121` `// 折り返し幅 (wordwrappoint.x は原点右基準の負オフセット指定)`
- `ui/js/ghost/balloon-window.js:122` `const ww = parseInt(props["wordwrappoint.x"], 10);`
