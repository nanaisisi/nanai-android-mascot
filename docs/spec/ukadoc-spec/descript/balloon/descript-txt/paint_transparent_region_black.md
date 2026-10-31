# paint_transparent_region_black,数値

- **規格**: [paint_transparent_region_black.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/) (ukadoc-spec/descript/balloon/descript-txt/paint_transparent_region_black.md)
- **検索語**: paint_transparent_region_black
- **対応状況**: ✅ 対応済

## 突合結果

`ui/js/core/actions/balloon-descript.js` にて `paint_transparent_region_black` プロパティをパースし、CSS 変数 `--balloon-paint-black` として動的適用を実装済み。

## 実装箇所

- `ui/js/core/actions/balloon-descript/assets.js:127` `// [paint_transparent_region_black,数値]:`
- `ui/js/core/actions/balloon-descript/assets.js:129` `props.paint_transparent_region_black === "1" ||`
- `ui/js/core/actions/balloon-descript/assets.js:130` `props.paint_transparent_region_black?.toLowerCase() === "true";`
- `tests/balloon-descript.test.js:136` `paint_transparent_region_black: "1",`
