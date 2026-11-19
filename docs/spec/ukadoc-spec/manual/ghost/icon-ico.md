# ghost/master/*.ico

- **規格**: [ghost.md](../../../../ukadoc-spec/manual/ghost.md) ([公式版](https://ukatech.shillest.net/ukadoc-spec/manual/ghost/))
- **検索語**: update_tray_for_ghost
- **対応状況**: ✅ 実装済

## 突合結果

`docs/ukadoc-spec/manual/ghost.md` の `*.ico`（32×32 / 16×16 のアイコンファイル）について、Desktop 環境では `load_ghost` 時に `update_tray_for_ghost` が呼び出され、`ghost/master/descript.txt` の `icon.minimize` / `icon` または `icon_minimize.ico` / `tray.ico` 等を読み込んでトレイアイコンへ反映する（Android 版は無処理スタブ）。一方、ゴーストエクスプローラー画面（`renderGhostList`）でのアイコン表示、任意の `*.ico` 自動検出、および 16×16 / 32×32 アイコンサイズの明示的な使い分けは未実装。

## 実装箇所

- `src-tauri/src/tray/updater.rs:14` `pub fn update_tray_for_ghost(`
- `src-tauri/src/tray/updater.rs:29` `.and_then(|m| m.get("icon.minimize").or_else(|| m.get("icon")))`
- `src-tauri/src/tray/updater.rs:32` `let icon_min_ico = ghost_master_dir.join("icon_minimize.ico");`
- `src-tauri/src/commands/shiori/lifecycle/load.rs:116` `let _ = crate::tray::update_tray_for_ghost(&app_handle, &ghost_name, &ghost_master_dir);`
- `crates/nanai-vfs/src/encoding/mime.rs:20` `} else if lower.ends_with(".ico") {`

## 実装 (外部ファイル探索)

- `discover_ghost_assets` / `GhostAssets`（`src-tauri/src/ghost/scan/assets.rs`）が `ghost/master/` から thumbnail.png/jpg・ai0.png・ai0_dark.png・*.cur・*.ico を大文字小文字無視で探索し、`GhostInfo.assets` として `scan_ghost_directory` が返す。
- 実在ファイルのみ列挙し、組み込みダミーは持たない。単体テスト: `discovers_assets_from_files`。
- UI 描画（サムネイル表示・カーソル適用）は未着手で、パス提供までを実装済みとする。

