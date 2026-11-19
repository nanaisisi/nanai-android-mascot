# 全体の構成 (manual/directory.md)

- **規格**: [directory.md](../../../ukadoc-spec/manual/directory.md) ([公式版](https://ukatech.shillest.net/ukadoc-spec/manual/directory/))
- **検索語**: scan_ghost_directory
- **対応状況**: ⚠️ 一部対応

ベースウェア配下のゴースト・シェル・バルーンのフォルダ構成および各ルート直下・サブフォルダ内の構成ファイル配置仕様に対する実装状況。`ghost/master/`・`shell/master/`・`shell/(additional_shell)/`・`(myballoon)/` の走査と VFS 大文字小文字吸収は実装済である一方、`delete[数字].txt`・`.narignore`/`.updateignore`/`.narinclude`/`.updateinclude` のパターン制御・`readme.md`/`terms.md` 解釈・ゴースト側 `thumbnail.png` 等は未実装または一部対応。

| 仕様項目 | 対応状況 | 実装・備考 |
| :--- | :---: | :--- |
| [`(myghost)/` (ゴーストホームディレクトリ)](directory/ghost-root.md) | ✅ 実装済 | `scan_ghost_directory` (`src-tauri/src/ghost/scan/directory/scan.rs`) と `resolve_ghost_directory` (`src-tauri/src/common/paths.rs`) で `userData/ghost/`、`assets/ghost/`、`ghost/` 配下を優先順位付きで走査・解決。 |
| [`(myghost)/ghost/` / `(myghost)/ghost/master/`](directory/ghost-master.md) | ✅ 実装済 | `parse_ghost_manifest` (`src-tauri/src/ghost/scan/directory/manifest/parser.rs`) と `load_ghost` (`src-tauri/src/commands/shiori/lifecycle/load.rs`) で `ghost/master/` を基準ディレクトリとして認識。 |
| `(myghost)/ghost/master/descript.txt` | ✅ 実装済 | `read_descript_file` (`src-tauri/src/ghost/scan/descript.rs`) および `parse_ghost_manifest` で最優先に読み込み、Shift_JIS / UTF-8 判定に対応。 |
| `(myghost)/ghost/master/shiori.dll` | ⚠️ 一部対応 | `load_ghost` / `ShioriDynamicEngine` (`src-tauri/src/shiori/dynamic/engine.rs`) で Windows DLL（32bit は `shiori-host32.exe`）・Unix `.so` をロード。Android は C-ABI 動的ロード非対応のため WASM/フォールバック動作。 |
| `(myghost)/ghost/master/makoto.dll` | ❌ 未実装 | `descript.txt` の `makoto` キー文字列取得 (`src-tauri/src/ghost/scan/directory/manifest/parser.rs`) と JS コマンド口 (`ui/ts/ghost/command-handler/system/shiori.ts`) のみで、実ファイルのロード・トランスレート実行は未実装。 |
| `(myghost)/ghost/master/updates2.dau` | ⚠️ 一部対応 | `generate_updates2_dau` (`src-tauri/src/commands/update/generation.rs`) でルートと `ghost/master/` の両方へ生成するが、スキャン (`scan.rs`) やネットワーク更新チェック (`check.rs`) はルート基準で動作。 |
| `(myghost)/ghost/master/*.ico` | ⚠️ 一部対応 | Desktop トレイ更新処理 `update_tray_for_ghost` (`src-tauri/src/tray/updater.rs`) で `descript.txt` の `icon.minimize` / `icon` および `icon_minimize.ico` / `tray.ico` を読み込み（Android は無処理）。 |
| `(myghost)/ghost/master/*.cur` | ❌ 未実装 | `ghost/master/` 配下の `*.cur` 読み込み・カーソル切替は未実装。 |
| `(myghost)/shell/` | ✅ 実装済 | `scan_shells_from_ghost` (`src-tauri/src/ghost/scan/shell/mod.rs`) と `resolve_shell_dir` (`src-tauri/src/commands/shell/manifest.rs`) で `shell/` 配下を走査・解決。 |
| [`(myghost)/shell/master/`](directory/shell-master.md) | ✅ 実装済 | `scan_shells_from_ghost` が `master` を先頭に優先ソートし、未存在時もフォールバック生成する。 |
| [`(myghost)/shell/(additional_shell)/`](directory/additional-shell.md) | ✅ 実装済 | `shell/` 内の任意サブディレクトリを検出し、`ghost/master/descript.txt` とシェル側 `descript.txt` をマージして切り替え可能。 |
| `(myghost)/shell/<shell>/descript.txt` | ✅ 実装済 | `scan_shells_from_ghost` および `shell_manifest` (`src-tauri/src/commands/shell/manifest.rs`) で読み込み。 |
| `(myghost)/shell/<shell>/surface*.png` / `surface*.pna` | ✅ 実装済 | `load_surface_image` / `load_surface_pna` (`src-tauri/src/commands/file/surface_image.rs`) で追加シェル優先・`master` フォールバック・VFS 大文字小文字吸収付きで読み込み。 |
| `(myghost)/shell/<shell>/(element).png` / `(element).pna` | ⚠️ 一部対応 | 非 Tauri 環境では `fileName` 直接解決 (`ui/ts/surface/ghost-surface-dom.ts`) で任意ファイル名を読めるが、Tauri 環境では `load_surface_image` が数値 ID (`surface<数字>`) 前提のため任意の非 `surface*` ファイル名が解決できない。 |
| `(myghost)/shell/<shell>/surfaces.txt` / `surfaces**.txt` | ⚠️ 一部対応 | `shell_manifest` 経由の `Shell::load` (`src-tauri/src/ui_adapter/shell.rs`) で `surfaces.txt` と `surfaces2.txt` のマージに対応。任意の `surfaces**.txt` 連番・ワイルドカード読み込みや UI 側 `open_file` フォールバック時は `surfaces.txt` のみ。 |
| `(myghost)/shell/<shell>/surfacetable.txt` | ✅ 実装済 | `Shell::load` (`src-tauri/src/ui_adapter/shell.rs`, `src-tauri/src/commands/shell/mod.rs`) で `surfacetable.txt` を任意読み込みし、マニフェストへ格納。 |
| `(myghost)/shell/<shell>/alias.txt` | ❌ 未実装 | 旧仕様の独立ファイル `alias.txt` は未対応（`surfaces.txt` 内の `surface.alias` ブロックのみ解釈）。 |
| `(myghost)/shell/<shell>/makoto.dll` | ❌ 未実装 | シェル配下の `makoto.dll` ロード・実行は未実装。 |
| `(myghost)/shell/<shell>/menu_background.png` / `menu_foreground.png` / `menu_sidebar.png` | ✅ 実装済 | `extract_shell_menu_theme` (`src-tauri/src/ghost/scan/shell/theme.rs`) で `shell/`、`ghost/master/`、ルートから探索し Data URL 化。 |
| `(myghost)/shell/<shell>/readme.txt` / `thumbnail.png` | ❌ 未実装 | `scan_shells_from_ghost` (`src-tauri/src/ghost/scan/shell/mod.rs`) はシェル配下の `readme.txt` および `thumbnail.png` を読み込まない。 |
| [`(myghost)/delete.txt`](directory/delete-txt.md) | ✅ 実装済 | `process_delete_txt` (`src-tauri/src/commands/install/archive/postprocess.rs`) でアーカイブ展開後およびネットワーク更新後 (`execute.rs`) に削除対象を処理。 |
| [`(myghost)/delete1.txt` (`delete[数字].txt`)](directory/delete-txt.md) | ❌ 未実装 | `process_delete_txt` は `"delete.txt"` のみ参照し、`delete1.txt` 等の番号付き削除ファイルは未対応。 |
| [`(myghost)/developer_options.txt`](directory/developer-options-txt.md) | ⚠️ 一部対応 | `parse_developer_options` (`src-tauri/src/ghost/scan/directory/filter.rs`)、`generate_updates2_dau` (`src-tauri/src/commands/update/generation.rs`)、`parse_developer_options_txt` (`crates/nanai-core/src/update_protocol/helpers.rs`) で `noupdate=` を解析。NAR 作成 (`packaging.rs`) では `developer_options.txt` の動的読込ではなく固定除外リストを使用。 |
| [`(myghost)/.narignore` / `.updateignore` / `.narinclude` / `.updateinclude`](directory/narignore-updateignore.md) | ❌ 未実装 | `should_skip_directory` (`src-tauri/src/ghost/scan/directory/filter.rs`) に存在チェックがあるが、ファイル単位の除外/包含パターン適用ではなく「ゴーストフォルダ全体をスキャンからスキップする」判定として実装されており、NAR・更新生成時のパターン制御は未実装。 |
| [`(myghost)/readme.txt` または `readme.md`](directory/readme-txt-md.md) | ⚠️ 一部対応 | `\![open,readme]` (`ui/ts/ghost/command-handler/system/target.ts`) が `readme.txt` 固定で未登録コマンド `open_path` を呼び出す実装にとどまり、`readme.md` の Markdown 装飾表示や相対画像埋込は未実装。 |
| [`(myghost)/terms.txt` または `terms.md`](directory/terms-txt-md.md) | ❌ 未実装 | 通知イベント (`ui/ts/ghost/shiori-notify/ghost-lifecycle/terms.ts`) とモーダル表示枠 (`ui/ts/ui/renderers/modal-dialog-system.ts`) はあるが、インストール前・アーカイブ内の `terms.txt` / `terms.md` 読込およびダイアログ中断処理は未実装。 |
| [`(myghost)/thumbnail.png`](directory/thumbnail-png.md) | ❌ 未実装 | `GhostInfo` (`src-tauri/src/common/models/ghost.rs`) および `scan_ghost_directory` (`src-tauri/src/ghost/scan/directory/scan.rs`) でゴースト側 `thumbnail.png` / `.jpg` / `.pnr` は未読込。 |
| [`(myballoon)/` (バルーンホームディレクトリ)](directory/balloon-root.md) | ⚠️ 一部対応 | `scan_balloons` / `resolve_balloon_dir` (`src-tauri/src/commands/shell/balloon.rs`) で `assets/balloon/`、`balloon/` 等から共通バルーンを走査。`descript.txt`・`balloons*s.txt`・`balloonk*s.txt`・`readme.txt`・`balloons*.png/.pna`・`balloonk*.png/.pna`・`arrow*.png`・`sstp*.png`・`marker*.png`・`thumbnail.png`・`delete.txt` に対応し、`terms.txt/md`・`balloonc*`・`ok_down/cancel_down/mode_down`・`delete[数字].txt` は未対応。 |

## 実装箇所

- `src-tauri/src/ghost/scan/directory/scan.rs:14` `pub async fn scan_ghost_directory(`
- `src-tauri/src/ghost/scan/shell/mod.rs:14` `pub fn scan_shells_from_ghost(ghost_dir: &Path) -> Vec<ShellInfo> {`
- `src-tauri/src/common/paths.rs:121` `pub fn resolve_ghost_directory(`
- `src-tauri/src/commands/shell/balloon.rs:465` `pub fn resolve_balloon_dir(name: &str, app_handle: &tauri::AppHandle) -> Result<PathBuf, String> {`
- `src-tauri/src/commands/install/archive/postprocess.rs:55` `pub fn process_delete_txt(target_dir: &Path) {`
- `crates/nanai-vfs/src/resolver/path_resolution.rs:10` `pub fn resolve(&self, relative_path: &str) -> Option<PathBuf> {`
