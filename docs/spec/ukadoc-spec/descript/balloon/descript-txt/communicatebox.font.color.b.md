# communicatebox.font.color.b,数値

- **規格**: [communicatebox.font.color.b.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/) (ukadoc-spec/descript/balloon/descript-txt/communicatebox.font.color.b.md)
- **検索語**: communicatebox.font.color.b
- **対応状況**: ✅ 対応済

## 突合結果

`ui/js/core/actions/balloon-descript/layout.js` の `applyLayoutProperties()` において `rgbFromComponents(props, "communicatebox.font.color")` を通じて `communicatebox.font.color.r/g/b` を抽出し、`.communicate-box` DOM の `color` へバインドする実装が行われている。

## 実装箇所

- `ui/js/core/actions/balloon-descript/layout.js` `if (cbFontColor) cbEl.style.color = cbFontColor;`
