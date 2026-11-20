# seriko.force_disable_crossfade,値

- **規格**: [seriko.force_disable_crossfade.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell/descript-txt/seriko.force_disable_crossfade/) (ukadoc-spec/descript/shell/descript-txt/seriko.force_disable_crossfade.md)
- **検索語**: seriko.force_disable_crossfade
- **対応状況**: ⚠️ 一部対応

## 実装箇所

- `src-tauri/src/ghost/scan/shell/seriko.rs:10` `/// クロスフェード強制無効化 (`seriko.force_disable_crossfade`)`
- `ui/ts/surface/shell-manifest.ts:694` `* `seriko.force_disable_crossfade` が有効（`1` または `true`）か判定する`
- `src-tauri/src/ghost/scan/shell/seriko.rs:47` `.get("seriko.force_disable_crossfade")`
- `ui/ts/surface/shell-manifest.ts:700` `manifest?.descript?.properties?.["seriko.force_disable_crossfade"];`
- `src-tauri/src/ghost/scan/shell/seriko.rs:100` `"seriko.force_disable_crossfade".to_string(),`
- `src-tauri/src/ghost/scan/shell/seriko.rs:128` `"seriko.force_disable_crossfade".to_string(),`
