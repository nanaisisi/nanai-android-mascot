# font.shadowcolor.g,数値

- **規格**: [font.shadowcolor.g.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/) (ukadoc-spec/descript/balloon/descript-txt/font.shadowcolor.g.md)
- **検索語**: font.shadowcolor.g
- **対応状況**: ✅ 実装済

## 突合結果

`ui/js/core/actions/balloon-descript/font.js` の `applyFontProperties()` において `rgbFromComponents(props, "font.shadowcolor")` を通じて `font.shadowcolor.r/g/b` を抽出し、`--balloon-font-shadow-color` カスタムプロパティへ反映する実装が行われている。

## 実装箇所

- `ui/ts/core/actions/balloon-descript/font/group.ts:13` `* [anchor.font.shadowcolor.r,数値], [anchor.font.shadowcolor.g,数値], [anchor.font.s`
- `ui/ts/core/actions/balloon-descript/font/group.ts:20` `* [anchor.visited.font.shadowcolor.r,数値], [anchor.visited.font.shadowcolor.g,数値]`
- `ui/ts/core/actions/balloon-descript/font/group.ts:27` `* [anchor.notselect.font.shadowcolor.r,数値], [anchor.notselect.font.shadowcolor.g`
- `ui/ts/core/actions/balloon-descript/font/group.ts:35` `* [cursor.font.shadowcolor.r,数値], [cursor.font.shadowcolor.g,数値], [cursor.font.s`
- `ui/ts/core/actions/balloon-descript/font/group.ts:42` `* [cursor.notselect.font.shadowcolor.r,数値], [cursor.notselect.font.shadowcolor.g`
