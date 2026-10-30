# surface\*ブレスとsurface.append\*ブレス

- **規格**: [caption_surface.append.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell-surfaces/surface-brace/caption_surface.append/) (ukadoc-spec/descript/shell-surfaces/surface-brace/caption_surface.append.md)
- **検索語**: surface
- **対応状況**: ✅ 対応済 (surface-load.js)\n\n## 突合結果\n\nui/js/surface/surface-load.js の loadSurfacesTxt において surfaces.txt ファイル・エイリアス・アニメーション・衝突判定定義をパース・解決する実装が行われている。\n\n## 実装箇所

- `src-tauri/src/fmo.rs:11` `pub surface0: u32,`
- `src-tauri/src/fmo.rs:12` `pub surface1: u32,`
- `src-tauri/src/fmo.rs:41` `surface0: 0,`
- `src-tauri/src/fmo.rs:42` `surface1: 10,`
- `src-tauri/src/lib.rs:99` `commands::shell::parse_surfaces_text,`
