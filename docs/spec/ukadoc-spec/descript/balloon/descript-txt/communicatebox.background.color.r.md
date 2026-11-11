# communicatebox.background.color.r,数値

- **規格**: [communicatebox.background.color.r.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/) (ukadoc-spec/descript/balloon/descript-txt/communicatebox.background.color.r.md)
- **検索語**: communicatebox.background.color.r
- **対応状況**: ✅ 実装済

## 突合結果

`ui/js/core/actions/balloon-descript/layout.js` の `applyLayoutProperties()` において `rgbFromComponents(props, "communicatebox.background.color")` を通じて `communicatebox.background.color.r/g/b` を抽出し、`.communicate-box` DOM の `backgroundColor` へバインドする実装が行われている。

## 実装箇所

- `ui/ts/core/actions/balloon-descript/layout/communicate-box.ts:9` `// [communicatebox.font.name,フォント名], [communicatebox.font.color.r/g/b,数値], [comm`
- `ui/ts/core/actions/balloon-descript/layout/communicate-box.ts:25` `props["communicatebox.background.color.r"] ||`
- `tests/balloon-descript-layout/communicate-box.test.ts:58` `"communicatebox.background.color.r": "255",`
