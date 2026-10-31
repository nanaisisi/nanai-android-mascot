# font.height,数値

- **規格**: [font.height.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/) (ukadoc-spec/descript/balloon/descript-txt/font.height.md)
- **検索語**: font.height
- **対応状況**: ✅ 対応済

## 突合結果

`app-actions.js` の `applyBalloonDescript()` において `props["font.height"]` をパースし、文書のルート要素に対して `--balloon-font-size: \`${fh}px\`` カスタムプロパティとして動的バインドされる実装が行われている。

## 実装箇所

- `ui/js/core/actions/balloon-descript/layout.js:34` `const cbFontHeight = parseInt(props["communicatebox.font.height"], 10);`
- `ui/js/core/actions/balloon-descript/font/base.js:13` `if (props["font.height"]) {`
- `ui/js/core/actions/balloon-descript/font/base.js:14` `const fh = parseInt(props["font.height"], 10);`
- `ui/js/core/actions/balloon-descript/font/special.js:22` `const numFontHeight = parseInt(props["number.font.height"], 10);`
- `ui/js/core/actions/balloon-descript/font/special.js:42` `const sstpFontHeight = parseInt(props["sstpmessage.font.height"], 10);`
