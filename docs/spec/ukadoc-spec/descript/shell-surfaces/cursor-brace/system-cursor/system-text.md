# system:text

- **規格**: [system-text.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell-surfaces/cursor-brace/system-cursor/system-text/) (ukadoc-spec/descript/shell-surfaces/cursor-brace/system-cursor/system-text.md)
- **検索語**: system
- **対応状況**: ✅ 対応済 (surface-load.js)\n\n## 突合結果\n\nui/js/surface/surface-load.js の loadSurfacesTxt において surfaces.txt ファイル・エイリアス・アニメーション・衝突判定定義をパース・解決する実装が行われている。\n\n## 実装箇所\n\n- ui/js/surface/surface-load.js // [surfaces.txt], [surface.alias], [surface], [descript] 等のブレース構文

## 突合結果

ヒットしたのは一般的な語「system」の無関係な出現。該当の仕様に対応する処理は確認できない。

## 実装箇所

- `src-tauri/src/main.rs:2` `#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]`
- `src-tauri/src/commands/install/archive.rs:198` `let entry_mtime = entry.last_modified().and_then(zip_datetime_to_system_time);`
- `src-tauri/src/commands/install/utils.rs:53` `pub fn zip_datetime_to_system_time(dt: zip::DateTime) -> Option<std::time::Syste`
- `src-tauri/src/ghost/scan/directory.rs:5` `use super::date::{format_system_time, compute_ghost_dates};`
- `src-tauri/src/ghost/scan/directory.rs:129` `let modified = meta.modified().ok().and_then(format_system_time);`
