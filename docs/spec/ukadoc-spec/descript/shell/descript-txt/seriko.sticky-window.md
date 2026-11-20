# seriko.sticky-window,スコープID,スコープID,...

- **規格**: [seriko.sticky-window.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell/descript-txt/seriko.sticky-window/) (ukadoc-spec/descript/shell/descript-txt/seriko.sticky-window.md)
- **検索語**: seriko.sticky-window
- **対応状況**: ⚠️ 一部対応

## 実装箇所

- `src-tauri/src/ghost/scan/shell/seriko.rs:14` `/// 連動移動スコープ群 (`seriko.sticky-window`)`
- `ui/ts/surface/shell-manifest.ts:716` `* `seriko.sticky-window` のスコープ ID 列を返す`
- `src-tauri/src/ghost/scan/shell/seriko.rs:60` `.get("seriko.sticky-window")`
- `ui/ts/surface/shell-manifest.ts:722` `manifest?.descript?.properties?.["seriko.sticky-window"],`
- `src-tauri/src/ghost/scan/shell/seriko.rs:104` `props.insert("seriko.sticky-window".to_string(), "0,1".to_string());`
