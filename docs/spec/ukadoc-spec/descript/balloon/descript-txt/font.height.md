# font.height,数値

- **規格**: [font.height.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/) (ukadoc-spec/descript/balloon/descript-txt/font.height.md)
- **検索語**: font.height
- **対応状況**: ✅ 対応済

## 突合結果

`app-actions.js` の `applyBalloonDescript()` において `props["font.height"]` をパースし、文書のルート要素に対して `--balloon-font-size: \`${fh}px\`` カスタムプロパティとして動的バインドされる実装が行われている。

## 実装箇所

- `ui/js/ghost/balloon-window.js:90` `const fh = parseInt(props["font.height"], 10);`
- `ui/js/core/actions/balloon-descript.js:50` `if (props["font.height"]) {`
- `ui/js/core/actions/balloon-descript.js:51` `const fh = parseInt(props["font.height"], 10);`
