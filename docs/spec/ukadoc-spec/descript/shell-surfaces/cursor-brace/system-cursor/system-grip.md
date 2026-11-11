# system:grip

- **規格**: [system-grip.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell-surfaces/cursor-brace/system-cursor/system-grip/) (ukadoc-spec/descript/shell-surfaces/cursor-brace/system-cursor/system-grip.md)
- **検索語**: system
- **対応状況**: ⚠️ 一部対応

## 突合結果

ui/js/surface/surface-load.js の loadSurfacesTxt において surfaces.txt ファイル・エイリアス・アニメーション・衝突判定定義をパース・解決する実装が行われている。

## 実装箇所

- `src-tauri/shiori-host/src/ffi.rs:10` `extern "system" {`
- `src-tauri/shiori-host/src/main.rs:189` `extern "system" {`
- `src-tauri/src/shiori/fmo.rs:38` `unsafe extern "system" {`
- `src-tauri/src/shiori/dynamic/host.rs:19` `unsafe extern "system" {`
- `src-tauri/src/shiori/property/tests.rs:22` `assert_eq!(evaluate_property_query("system.year"), "2026");`
