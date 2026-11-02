# anchor.font.shadowcolor.r,数値

- **規格**: [anchor.font.shadowcolor.r.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/) (ukadoc-spec/descript/balloon/descript-txt/anchor.font.shadowcolor.r.md)
- **検索語**: anchor.font.shadowcolor.r
- **対応状況**: ✅ 実装済

## 突合結果

`ui/js/core/actions/balloon-descript/font.js` の `applyFontProperties()` 内 `applyAnchorGroup("anchor", "--balloon-anchor")` において `rgbFromComponents(props, "anchor.font.shadowcolor")` をパースし、`--balloon-anchor-shadow-color` カスタムプロパティへバインドする実装が行われている。

## 実装箇所

- `ui/js/core/actions/balloon-descript/font/group.js:5` `* UKADOC仕様 (anchor.style, anchor.blendmethod, anchor.font.color.r/g/b, anchor.fo`
