# オーナードローメニュー (manual/owner-draw-menu.md)

- **規格**: [owner-draw-menu.md](../../../ukadoc-spec/manual/owner-draw-menu.md) ([公式版](https://ukatech.shillest.net/ukadoc-spec/manual/owner-draw-menu/))
- **検索語**: menu.background.bitmap.filename, menu_background.png
- **対応状況**: ⚠️ 一部対応

オーナードローメニュー（右クリックメニュー）の背景・選択カーソル・サイドバー画像の読み込みとメニューテーマ適用を実装。シェル `descript.txt` 由来の画像・配色・文字色設定に対応している一方、SHIORI Resource 指定および優先順位制御、画像切れ端部の単色塗り潰しフォールバック、未指定時にダミー画像を生成せず標準ポップアップへ戻す動作には一部制約がある。

| 仕様項目 | 対応状況 | 実装・備考 |
| :--- | :---: | :--- |
| [`menu_background.png`](owner-draw-menu/menu-background-png.md)（背景画像・メニュー領域基準・省略可能） | ⚠️ 一部対応 | `src-tauri/src/ghost/scan/shell/theme.rs:42-50` で読み込み、`ui/ts/ui/renderers/menu-theme-renderer.ts:180-182` と `ui/ts/ui/submenu-theme.ts:133-135` が `--menu-bg-image` を設定しメニューサイズで表示。ただし `src-tauri/src/ghost/scan/shell/bitmap.rs:53-66` が画像不在時に 1x1 白 PNG Data URL を合成するため無画像時の標準表示にならない場合がある |
| [`menu_foreground.png`](owner-draw-menu/menu-foreground-png.md)（カーソル選択部分画像・省略可能） | ⚠️ 一部対応 | `src-tauri/src/ghost/scan/shell/theme.rs:51-60` で読み込み、`ui/css/context-menu.css:171-177` と `ui/css/submenu-window.css:64-71` の hover / focus / `.is-current` に `--menu-fg-image` を適用。ただし `src-tauri/src/ghost/scan/shell/bitmap.rs:69-83` が不在時に 1x1 黒 PNG Data URL を合成する |
| [`menu_sidebar.png`](owner-draw-menu/menu-sidebar-png.md)（左側追加画像・横幅のみ画像幅・省略可能） | ⚠️ 一部対応 | `src-tauri/src/ghost/scan/shell/theme.rs:61-69` で読み込み、`ui/ts/ui/submenu-theme.ts:151-182` と `ui/ts/ui/renderers/menu-theme-renderer.ts:198-220` が `body.has-sidebar` と `--menu-sidebar-width`（`naturalWidth`）を反映（`ui/css/context-menu.css:85-106`、`ui/css/submenu-window.css:93-113`）。ただし `bitmap.rs:86-107` が不在時に `shell_dir` へ実ファイルを書き出す |
| [任意パス配置・任意ファイル名（SHIORI Resource 時は `ghost/master` 基点）](owner-draw-menu/resource-and-descript-priority.md) | ⚠️ 一部対応 | `src-tauri/src/ghost/scan/shell/bitmap.rs:22-33` は `shell_dir`・`ghost_master_dir`・`ghost_dir` を順に `nanai_vfs::resolve_vfs_path` で解決し任意ファイル名・サブフォルダに対応（`crates/nanai-core/src/descript_parser/types.rs:127-129` も参照）。一方 `ui/ts/ui/app-menu.ts:83-89` は `menu.*.bitmap` キーのみ参照し、SHIORI Resource からの `ghost/master` 相対パス指定は未対応 |
| [設定手段・優先順位（シェル `descript.txt` vs `SHIORI Resource` 優先）](owner-draw-menu/resource-and-descript-priority.md) | ⚠️ 一部対応 | `src-tauri/src/ghost/scan/shell/mod.rs:18-44` と `theme.rs:12-115` が `ghost/master/descript.txt` とシェル `descript.txt` をマージして色・フォント・ビットマップを取得。ただし `SHIORI Resource` による `menu.*` 取得とシェル設定に対する優先上書きは未実装（`ui/ts/ui/renderers/menu-caption-renderer.ts:49-83` は項目キャプションのみ取得、`src-tauri/src/shiori/property/evaluator/static_rules.rs:61-77` は固定値応答のみ） |
| [画像切れ端部の端色単色塗り潰し](owner-draw-menu/resource-and-descript-priority.md) | ❌ 未実装 | 画像よりメニュー領域が大きい場合に端ピクセル色で単色塗り潰しする処理は未実装（`ui/css/context-menu.css:74`・`ui/css/submenu-window.css:18`・`menu-theme-renderer.ts:161-172` は CSS `background-repeat` と `--balloon-bg` のみ使用） |
| [未指定時の標準ポップアップ表示](owner-draw-menu/resource-and-descript-priority.md) | ⚠️ 一部対応 | フロントエンドはビットマップ・テーマ `null` 時に CSS 変数を除去して標準表示へ戻る（`menu-theme-renderer.ts:234-253`、`submenu-theme.ts:136-181`、`tests/menu-renderers.test.ts:294-305`、`tests/submenu-theme.test.ts:68-78`）が、Rust スキャン経路では `descript.txt` 存在時に `bitmap.rs` がダミー画像を補完する |

## 実装箇所

- `src-tauri/src/ghost/scan/shell/theme.rs:43` `.get("menu.background.bitmap.filename")`
- `src-tauri/src/ghost/scan/shell/bitmap.rs:5` `pub fn load_menu_bitmap_data_url(`
- `src-tauri/src/ghost/scan/shell/mod.rs:43` `extract_shell_menu_theme(&merged, &path, &ghost_master_dir, ghost_dir);`
- `crates/nanai-core/src/descript_parser/types.rs:127` `pub fn menu_background_bitmap(&self) -> Option<&str> {`
- `ui/ts/ui/renderers/menu-theme-renderer.ts:175` `const bgUrl = resolveImg(mt.background_bitmap);`
- `ui/ts/ui/submenu-theme.ts:33` `export function applyShellMenuTheme(`
- `ui/css/context-menu.css:73` `background-image: var(--menu-bg-image, var(--balloon-pattern, none));`
- `tests/menu-renderers.test.ts:208` `menu_theme: {`
