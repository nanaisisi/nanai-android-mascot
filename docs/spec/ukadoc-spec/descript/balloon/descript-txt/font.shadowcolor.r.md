# font.shadowcolor.r,数値

- **規格**: [font.shadowcolor.r.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/) (ukadoc-spec/descript/balloon/descript-txt/font.shadowcolor.r.md)
- **検索語**: font.shadowcolor.r
- **対応状況**: ✅ 実装済

## 突合結果

`ui/js/core/actions/balloon-descript/font.js` の `applyFontProperties()` において `rgbFromComponents(props, "font.shadowcolor")` を通じて `font.shadowcolor.r/g/b` を抽出し、`--balloon-font-shadow-color` カスタムプロパティへ反映する実装が行われている。

## 実装箇所

- `ui/ts/core/actions/balloon-descript/font/group.ts:5` `* UKADOC仕様 (anchor.style, anchor.blendmethod, anchor.font.color.r/g/b, anchor.fo`
- `ui/ts/core/actions/balloon-descript/font/group.ts:13` `* [anchor.font.shadowcolor.r,数値], [anchor.font.shadowcolor.g,数値], [anchor.font.s`
- `ui/ts/core/actions/balloon-descript/font/group.ts:20` `* [anchor.visited.font.shadowcolor.r,数値], [anchor.visited.font.shadowcolor.g,数値]`
- `ui/ts/core/actions/balloon-descript/font/group.ts:27` `* [anchor.notselect.font.shadowcolor.r,数値], [anchor.notselect.font.shadowcolor.g`
- `ui/ts/core/actions/balloon-descript/font/group.ts:35` `* [cursor.font.shadowcolor.r,数値], [cursor.font.shadowcolor.g,数値], [cursor.font.s`
