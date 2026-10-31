# system:text

- **規格**: [system-text.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell-surfaces/cursor-brace/system-cursor/system-text/) (ukadoc-spec/descript/shell-surfaces/cursor-brace/system-cursor/system-text.md)
- **検索語**: system
- **対応状況**: ✅ 対応済 (surface-load.js)\n\n## 突合結果\n\nui/js/surface/surface-load.js の loadSurfacesTxt において surfaces.txt ファイル・エイリアス・アニメーション・衝突判定定義をパース・解決する実装が行われている。\n\n## 実装箇所

- `src-tauri/shiori-host/src/main.rs:18` `extern "system" {`
- `src-tauri/shiori-host/src/main.rs:260` `extern "system" {`
- `src-tauri/src/lib.rs:157` `shiori::property::get_system_property,`
- `src-tauri/src/main.rs:2` `#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]`
- `src-tauri/src/commands/install/utils.rs:55` `pub fn zip_datetime_to_system_time(dt: zip::DateTime) -> Option<std::time::Syste`
