# seriko.dpi,推奨DPI

- **規格**: [seriko.dpi.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell/descript-txt/seriko.dpi/) (ukadoc-spec/descript/shell/descript-txt/seriko.dpi.md)
- **検索語**: seriko.dpi
- **対応状況**: ⚠️ 一部対応

## 実装箇所

- `src-tauri/src/ghost/scan/shell/seriko.rs:8` `/// 推奨 DPI (`seriko.dpi`)`
- `ui/ts/surface/shell-manifest.ts:673` `* `seriko.dpi` を取得する（未設定・不正値の場合は 96）`
- `src-tauri/src/ghost/scan/shell/seriko.rs:42` `.get("seriko.dpi")`
- `ui/ts/surface/shell-manifest.ts:678` `const raw = manifest?.descript?.properties?.["seriko.dpi"];`
- `src-tauri/src/ghost/scan/shell/seriko.rs:98` `props.insert("seriko.dpi".to_string(), "144".to_string());`
- `ui/ts/surface/shell-manifest.ts:685` `* `seriko.dpi` に基づく描画スケール倍率（`96 / dpi`）を返す`
