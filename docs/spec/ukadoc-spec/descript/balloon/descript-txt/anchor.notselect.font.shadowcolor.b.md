# anchor.notselect.font.shadowcolor.b,数値

- **規格**: [anchor.notselect.font.shadowcolor.b.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/) (ukadoc-spec/descript/balloon/descript-txt/anchor.notselect.font.shadowcolor.b.md)
- **検索語**: anchor.notselect.font.shadowcolor.b
- **対応状況**: ✅ 対応済

## 突合結果

`ui/js/core/actions/balloon-descript/font.js` の `applyFontProperties()` 内 `applyGroupProperties("anchor.notselect", "--balloon-anchor-notselect")` において `rgbFromComponents(props, "anchor.notselect.font.shadowcolor")` をパースし、`--balloon-anchor-notselect-shadow-color` カスタムプロパティへ反映する実装が行われている。

## 実装箇所

- `ui/js/core/actions/balloon-descript/font.js:231` `// [anchor.notselect.font.shadowcolor.r,数値], [anchor.notselect.font.shadowcolor.`
- `ui/js/core/actions/balloon-descript/font.js:235` `props["anchor.notselect.font.shadowcolor.b"] ||`
