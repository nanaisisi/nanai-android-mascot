# surface\*ブレスとsurface.append\*ブレス

- **規格**: [caption_surface.append.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell-surfaces/surface-brace/caption_surface.append/) (ukadoc-spec/descript/shell-surfaces/surface-brace/caption_surface.append.md)
- **検索語**: surface
- **対応状況**: ⚠️ 一部対応

## 突合結果

ui/js/surface/surface-load.js の loadSurfacesTxt において surfaces.txt ファイル・エイリアス・アニメーション・衝突判定定義をパース・解決する実装が行われている。

## 実装箇所

- `src-tauri/src/commands/file.rs:50` `"🖼️ [Rust File] load_surface_image: ghost_path={}, shell={}, surface={}, base_pa`
- `src-tauri/src/commands/file.rs:59` `shell_dir.join(format!("surface{surface_id}.png")),`
- `src-tauri/src/commands/file.rs:60` `shell_dir.join(format!("surface{surface_id_num:04}.png")),`
- `src-tauri/src/commands/file.rs:61` `shell_dir.join(format!("surface{surface_id_num:02}.png")),`
- `src-tauri/src/commands/file.rs:62` `shell_dir.join(format!("surface{surface_id}.bmp")),`
