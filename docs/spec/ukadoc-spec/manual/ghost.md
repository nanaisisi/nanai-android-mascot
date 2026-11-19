# ゴースト (manual/ghost.md)

- **規格**: [ghost.md](../../../ukadoc-spec/manual/ghost.md) ([公式版](https://ukatech.shillest.net/ukadoc-spec/manual/ghost/))
- **検索語**: parse_ghost_manifest
- **対応状況**: ⚠️ 一部対応

`(myghost)/ghost/master/` 配下の構成ファイル（`descript.txt`、`shiori.dll`、`(saori).dll`、`makoto.dll`、`updates2.dau`/`updates.txt`、`*.ico`、`*.cur`、`thumbnail.png`、`ai0.png`/`ai0_dark.png`、外部辞書等リソース）に対する実装状況。`descript.txt` 解析と Desktop 向け `shiori.dll` 動的ロード・32bit ホスト連携は実装済である一方、`makoto.dll`・`*.cur`・`thumbnail.png`・`ai0.png`/`ai0_dark.png` 等は未実装、Android 版 SHIORI 実行や `saori` 連携は一部対応。

| 仕様項目 | 対応状況 | 実装・備考 |
| :--- | :---: | :--- |
| `descript.txt` (`ghost/master/descript.txt`) | ✅ 実装済 | `parse_ghost_manifest` (`src-tauri/src/ghost/scan/directory/manifest/parser.rs`) と `read_descript_file` (`src-tauri/src/ghost/scan/descript.rs`) で必須識別ファイルとして読み込み、`name`、`sakura.name`、`kero.name`、`shiori`、`makoto`、`craftman`、`recommended.balloon`、`shiori.*`、`sstp.*` 等を抽出。 |
| `updates2.dau` (旧仕様・`ghost/master/` 配下) | ⚠️ 一部対応 | 現行仕様のルート直下を中心に `check_ghost_update` (`src-tauri/src/commands/update/network/commands/check.rs`) が取得し、`generate_updates2_dau` (`src-tauri/src/commands/update/generation.rs`) ではルートと `ghost/master/updates2.dau` の両方へ出力する。 |
| `updates.txt` (旧仕様・`ghost/master/` 配下) | ⚠️ 一部対応 | `check_ghost_update` (`src-tauri/src/commands/update/network/commands/check.rs`) が `updates2.dau` 未存在時のフォールバックとして取得・解析するが、ローカル `ghost/master/updates.txt` の参照・生成は行わない。 |
| `shiori.dll` (`ghost/master/` 配下の SHIORI コア) | ⚠️ 一部対応 | `load_ghost` (`src-tauri/src/commands/shiori/lifecycle/load.rs`) が `descript.txt` の `shiori` 値や既定 DLL/SO 名を解決し、`ShioriDynamicEngine::load_library` (`src-tauri/src/shiori/dynamic/engine.rs`) でロード（Windows 64bit では `shiori-host32.exe` 経由で 32bit DLL 実行）。Android では C-ABI DLL ロード非対応のため WASM SHIORI / フォールバックで動作。 |
| `(saori).dll` (`ghost/master/` 配下等の SAORI モジュール) | ⚠️ 一部対応 | `execute_saori` (`src-tauri/src/shiori/saori.rs`) で内蔵 `SAORI-Ex` モジュールと非 Android 環境でのローカル `.dll`/`.so` ロード（未検出時はスタブ応答）を実装。ただしネイティブ SHIORI からの自動コールバック連携ではなく Tauri コマンド経由の実行。 |
| `makoto.dll` (`ghost/master/makoto.dll`) | ❌ 未実装 | `parse_ghost_manifest` (`src-tauri/src/ghost/scan/directory/manifest/parser.rs`) での `makoto` キー取得と `\![load,makoto]` 等の分岐 (`ui/ts/ghost/command-handler/system/shiori.ts`) のみ存在し、DLL ロードやトランスレート実行は未実装。 |
| `*.ico` (`ghost/master/*.ico`) | ⚠️ 一部対応 | Desktop 環境の `update_tray_for_ghost` (`src-tauri/src/tray/updater.rs`) が `descript.txt` の `icon.minimize` / `icon` または `icon_minimize.ico` / `tray.ico` を読み込みトレイアイコンへ反映（Android は未対応）。ゴーストエクスプローラでのアイコン表示は未実装。 |
| `*.cur` (`ghost/master/*.cur`) | ❌ 未実装 | `ghost/master/` 配下のカーソルファイル読み込み・ホバー時カーソル変更は未実装（バルーン `mousecursor.*` のみ別経路で対応）。 |
| `thumbnail.png` (`ghost/master/thumbnail.png` / JPG / PNR) | ❌ 未実装 | `GhostInfo` (`src-tauri/src/common/models/ghost.rs`) にサムネイル項目がなく、`scan_ghost_directory` (`src-tauri/src/ghost/scan/directory/scan.rs`) および `renderGhostList` (`ui/ts/ui/modal-ghost-handlers.ts`) でも未読込・未表示。 |
| `ai0.png` / `ai0_dark.png` (AI グラフ画像) | ❌ 未実装 | `parse_ghost_manifest` で `shiori.logo.file` / `align` / `x` / `y` を読み、`\![open,aigraph]` (`ui/ts/ghost/command-handler/system/target.ts`) の分岐はあるが、`ai0.png` / `ai0_dark.png` 画像ファイルの読込・表示は未実装。 |
| SHIORI 外部リソースファイル (辞書等) | ⚠️ 一部対応 | Desktop ネイティブ SHIORI では `load_ghost` (`src-tauri/src/commands/shiori/lifecycle/load.rs`) が `ghost/master/` パスを `load()` へ渡し、各 SHIORI DLL が外部辞書を参照可能。Web/Android 向けには `WasmShioriLoader` (`ui/ts/ghost/wasm-shiori-loader.ts`) が仮想ファイルマウント枠 (`mountVirtualFile`) を提供する。 |

## 実装箇所

- `src-tauri/src/ghost/scan/directory/manifest/parser.rs:8` `pub fn parse_ghost_manifest(path: &Path, dir_name: &str) -> GhostManifest {`
- `src-tauri/src/commands/shiori/lifecycle/load.rs:9` `pub async fn load_ghost(`
- `src-tauri/src/shiori/dynamic/engine.rs:36` `pub fn load_library(dll_path: &Path) -> Result<Self, ShioriError> {`
- `src-tauri/src/shiori/saori.rs:133` `pub async fn execute_saori(request: SaoriRequest) -> Result<SaoriResponse, String> {`
- `src-tauri/src/tray/updater.rs:14` `pub fn update_tray_for_ghost(`
- `ui/ts/ghost/wasm-shiori-loader.ts:29` `export class WasmShioriLoader {`
