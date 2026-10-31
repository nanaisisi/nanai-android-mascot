# communicatebox.font.name,フォント名

- **規格**: [communicatebox.font.name.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/) (ukadoc-spec/descript/balloon/descript-txt/communicatebox.font.name.md)
- **検索語**: communicatebox.font.name
- **対応状況**: ✅ 対応済

## 突合結果

`ui/js/core/actions/balloon-descript/layout.js` の `applyLayoutProperties()` において `props["communicatebox.font.name"]` を検出し、`.communicate-box` DOM の `fontFamily` へ反映する実装が行われている。

## 実装箇所

- `ui/js/core/actions/balloon-descript/layout.js:28` `// [communicatebox.font.name,フォント名], [communicatebox.font.color.r/g/b,数値], [comm`
- `ui/js/core/actions/balloon-descript/layout.js:33` `const cbFontName = props["communicatebox.font.name"];`
