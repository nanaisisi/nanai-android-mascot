# communicatebox.placeholder.color.b,数値

- **規格**: [communicatebox.placeholder.color.b.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/)
- **検索語**: communicatebox.placeholder.color.b
- **対応状況**: ✅ 対応済

## 突合結果

`ui/js/core/actions/balloon-descript.js` の `rgbFromComponents` により `communicatebox.placeholder.color.r/g/b` を合成し、CSS 変数 `--communicatebox-placeholder-color` として動的適用を実装済み。


## 実装箇所

- `ui/js/core/actions/balloon-descript/layout.js:52` `props["communicatebox.placeholder.color.b"];`
