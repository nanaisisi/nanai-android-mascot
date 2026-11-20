# seriko.zorder,スコープID,スコープID,...

- **規格**: [seriko.zorder.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell/descript-txt/seriko.zorder/) (ukadoc-spec/descript/shell/descript-txt/seriko.zorder.md)
- **検索語**: seriko.zorder
- **対応状況**: ⚠️ 一部対応

## 実装箇所

- `src-tauri/src/ghost/scan/shell/seriko.rs:12` `/// スコープ Z オーダー (`seriko.zorder`)`
- `ui/ts/surface/shell-manifest.ts:707` `* `seriko.zorder` のスコープ ID 列を返す`
- `src-tauri/src/ghost/scan/shell/seriko.rs:55` `.get("seriko.zorder")`
- `ui/ts/surface/shell-manifest.ts:712` `return parseScopeIdList(manifest?.descript?.properties?.["seriko.zorder"]);`
- `src-tauri/src/ghost/scan/shell/seriko.rs:103` `props.insert("seriko.zorder".to_string(), "1, 0, 2, 1".to_string());`
- `src-tauri/src/ghost/scan/shell/seriko.rs:131` `props.insert("seriko.zorder".to_string(), "abc, -1, 3".to_string());`
