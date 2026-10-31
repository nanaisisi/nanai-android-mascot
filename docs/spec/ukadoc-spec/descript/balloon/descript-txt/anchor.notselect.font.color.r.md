# anchor.notselect.font.color.r,数値

- **規格**: [anchor.notselect.font.color.r.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/) (ukadoc-spec/descript/balloon/descript-txt/anchor.notselect.font.color.r.md)
- **検索語**: anchor.notselect.font.color.r
- **対応状況**: ✅ 対応済

## 突合結果

`ui/js/core/actions/balloon-descript.js` の `rgbFromComponents` により `anchor.notselect.font.color.r/g/b` を合成し、CSS 変数 `--balloon-anchor-notselect-color` として動的適用を実装済み。

## 実装箇所

- `ui/js/core/actions/balloon-descript/font.js:223` `// [anchor.notselect.style,形状], [anchor.notselect.font.color.r,数値], [anchor.nots`
- `ui/js/core/actions/balloon-descript/font.js:226` `props["anchor.notselect.font.color.r"] ||`
- `tests/balloon-descript.test.js:103` `"anchor.notselect.font.color.r": "100",`
