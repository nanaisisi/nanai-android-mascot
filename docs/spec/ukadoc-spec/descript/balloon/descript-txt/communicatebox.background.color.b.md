# communicatebox.background.color.b,数値

- **規格**: [communicatebox.background.color.b.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/) (ukadoc-spec/descript/balloon/descript-txt/communicatebox.background.color.b.md)
- **検索語**: communicatebox.background.color.b
- **対応状況**: ✅ 対応済

## 突合結果

`ui/js/core/actions/balloon-descript/layout.js` の `applyLayoutProperties()` において `rgbFromComponents(props, "communicatebox.background.color")` を通じて `communicatebox.background.color.r/g/b` を抽出し、`.communicate-box` DOM の `backgroundColor` へバインドする実装が行われている。

## 実装箇所

- `ui/js/core/actions/balloon-descript/layout.js` `if (cbBgColor) cbEl.style.backgroundColor = cbBgColor;`
