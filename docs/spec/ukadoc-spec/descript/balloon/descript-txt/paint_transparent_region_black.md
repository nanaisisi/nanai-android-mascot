# paint_transparent_region_black,数値

- **規格**: [paint_transparent_region_black.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/) (ukadoc-spec/descript/balloon/descript-txt/paint_transparent_region_black.md)
- **検索語**: paint_transparent_region_black
- **対応状況**: ✅ 実装済

## 突合結果

`ui/js/core/actions/balloon-descript.js` にて `paint_transparent_region_black` プロパティをパースし、CSS 変数 `--balloon-paint-black` として動的適用を実装済み。

## 実装箇所

- `crates/ui/src/descript/parser/queries.rs:112` `self.get("seriko.paint_transparent_region_black")`
- `crates/ui/src/surfaces/compositor/blend/chromakey.rs:40` `pub fn paint_transparent_region_black(&mut self, target_r: u8, target_g: u8, tar`
- `crates/ui/src/surfaces/compositor/blend/chromakey.rs:72` `self.paint_transparent_region_black(r, g, b);`
- `ui/ts/core/actions/balloon-descript/assets.ts:261` `props.paint_transparent_region_black === "1" ||`
- `ui/ts/core/actions/balloon-descript/assets.ts:262` `props.paint_transparent_region_black?.toLowerCase() === "true";`
