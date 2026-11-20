# シェル descript.txt と SHIORI Resource の指定・優先順位・端色塗り潰し

- **規格**: [owner-draw-menu.md](../../../../ukadoc-spec/manual/owner-draw-menu.md) ([公式版](https://ukatech.shillest.net/ukadoc-spec/manual/owner-draw-menu/))
- **検索語**: extract_shell_menu_theme, menu.background.bitmap.filename
- **対応状況**: ✅ 実装済

## 突合結果

`scan_shells_from_ghost` と `extract_shell_menu_theme` が `ghost/master/descript.txt` とシェル `descript.txt` をマージし、`load_menu_bitmap_data_url` が `shell_dir`・`ghost_master_dir`・`ghost_dir` 順、`load_shiori_menu_bitmap_data_url` が `ghost_master_dir` 優先で任意ファイル名・サブフォルダ配置を解決する。フロントエンドでは `menuThemeRenderer.fetchShioriMenuTheme` / `mergeShioriMenuTheme` が `SHIORI Resource` の `menu.*` を動的取得してシェル設定へ優先上書きし、`ghost/master` 相対解決および非タイル時の端色抽出（`extractEdgeColorFromImage`）による `--balloon-bg` 単色塗り潰しフォールバックを行う。テーマ `null` 時は CSS 変数を除去して標準表示へ戻る。

## 実装箇所

- `src-tauri/src/ghost/scan/shell/mod.rs:33` `let mut merged: HashMap<String, String> = master_descript.clone();`
- `src-tauri/src/ghost/scan/shell/theme.rs:6` `pub fn extract_shell_menu_theme(`
- `src-tauri/src/ghost/scan/shell/bitmap.rs:22` `let search_bases = [shell_dir, ghost_master_dir, ghost_dir];`
- `crates/nanai-core/src/descript_parser/types.rs:127` `pub fn menu_background_bitmap(&self) -> Option<&str> {`
- `src-tauri/src/shiori/property/evaluator/static_rules.rs:61` `"menu.font.name" => "sans-serif",`
- `ui/ts/ui/renderers/menu-caption-renderer.ts:49` `async fetchShioriCaptions(`
- `ui/ts/ui/renderers/menu-theme-renderer.ts:147` `const applyAlignment = (alignRaw: string | undefined, prefix: string) => {`
- `tests/menu-renderers.test.ts:292` `menuThemeRenderer.applyShellTheme({`
