# communicatebox.font.color.r,数値

- **規格**: [communicatebox.font.color.r.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/) (ukadoc-spec/descript/balloon/descript-txt/communicatebox.font.color.r.md)
- **検索語**: communicatebox.font.color.r
- **対応状況**: ✅ 実装済

## 突合結果

`ui/js/core/actions/balloon-descript/layout.js` の `applyLayoutProperties()` において `rgbFromComponents(props, "communicatebox.font.color")` を通じて `communicatebox.font.color.r/g/b` を抽出し、`.communicate-box` DOM の `color` へバインドする実装が行われている。

## 実装箇所

- `ui/ts/core/actions/balloon-descript/layout/communicate-box.ts:9` `// [communicatebox.font.name,フォント名], [communicatebox.font.color.r/g/b,数値], [comm`
- `ui/ts/core/actions/balloon-descript/layout/communicate-box.ts:19` `props["communicatebox.font.color.r"] ||`
- `tests/balloon-descript/all-properties/mock-props.ts:9` `"communicatebox.font.color.r": "0",`
