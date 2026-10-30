# communicatebox.background.color.g,数値

- **規格**: [communicatebox.background.color.g.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/) (ukadoc-spec/descript/balloon/descript-txt/communicatebox.background.color.g.md)
- **検索語**: communicatebox.background.color.g
- **対応状況**: ✅ 対応済

## 突合結果

`ui/js/core/actions/balloon-descript/layout.js` の `applyLayoutProperties()` において `rgbFromComponents(props, "communicatebox.background.color")` を通じて `communicatebox.background.color.r/g/b` を抽出し、`.communicate-box` DOM の `backgroundColor` へバインドする実装が行われている。

## 実装箇所

- `ui/js/core/actions/balloon-descript/layout.js:45` `props["communicatebox.background.color.g"] ||`
