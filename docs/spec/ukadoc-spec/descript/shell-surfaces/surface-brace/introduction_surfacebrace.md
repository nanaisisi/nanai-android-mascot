# surfaceブレス記述例

- **規格**: [introduction_surfacebrace.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell-surfaces/surface-brace/introduction_surfacebrace/) (ukadoc-spec/descript/shell-surfaces/surface-brace/introduction_surfacebrace.md)
- **検索語**: surface
- **対応状況**: ⚠️ 一部対応

## 突合結果

surface-parser.js / surface-animation-manager.js に該当の解析・処理は確認できない。

## 実装箇所

- `src-tauri/src/commands/file.rs:50` `"🖼️ [Rust File] load_surface_image: ghost_path={}, shell={}, surface={}, base_pa`
- `src-tauri/src/commands/file.rs:59` `shell_dir.join(format!("surface{surface_id}.png")),`
- `src-tauri/src/commands/file.rs:60` `shell_dir.join(format!("surface{surface_id_num:04}.png")),`
- `src-tauri/src/commands/file.rs:61` `shell_dir.join(format!("surface{surface_id_num:02}.png")),`
- `src-tauri/src/commands/file.rs:62` `shell_dir.join(format!("surface{surface_id}.bmp")),`
