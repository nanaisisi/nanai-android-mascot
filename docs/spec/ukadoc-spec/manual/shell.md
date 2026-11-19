# シェル (manual/shell.md)

- **規格**: [shell.md](../../../ukadoc-spec/manual/shell.md) ([公式版](https://ukatech.shillest.net/ukadoc-spec/manual/shell/))
- **検索語**: surfaces.txt, load_surface_image, load_surface_pna, surfacetable.txt
- **対応状況**: ⚠️ 一部対応

シェルフォルダ内の `descript.txt`・`surfaces.txt`・`surfaces2.txt`・`surface*.png`・`surface*.pna`・`surfacetable.txt` の解析とサーフェス描画・クロマキー・透過判定を実装。一方、シェル `readme.txt`・`thumbnail.png`・`alias.txt`・任意名 `surfaces**.txt`・`makoto.dll`・Tauri 環境での任意ファイル名 `(element).png`/`.pna` 解決・SSP 2.7.38+ アニメ GIF/APNG/WebP や非推奨画像形式（暗号化 PNG 等）には未対応または制約がある。

| 仕様項目 | 対応状況 | 実装・備考 |
| :--- | :---: | :--- |
| `descript.txt`（シェル識別・基本設定） | ✅ 実装済 | `crates/ui/src/shell/core.rs:57`・`src-tauri/src/ghost/scan/shell/mod.rs:30-44`・`src-tauri/src/commands/shell/manifest.rs:31` でシェル `descript.txt` を読み込み `ShellManifest` / `ShellInfo` へ反映 |
| `readme.txt`（シェル製作者・配布元説明） | ❌ 未実装 | バルーン用 `get_balloon_readme`（`src-tauri/src/commands/shell/balloon.rs:127,171`）はあるが、シェル `shell/<name>/readme.txt` を参照・表示する処理は未実装 |
| `surface*.png`（左上 `(0,0)` 透過・`surface0`/`surface10`・ID 制限なし・SSP 2.7.38+ アニメ画像・非推奨形式） | ⚠️ 一部対応 | `src-tauri/src/commands/file/surface_image.rs:11-145` が PNG/BMP/SVG を大文字小文字非区別で探索し `surface0`/`surface10` フォールバックや `u32` ID に対応。左上 `(0,0)` クロマキーは `src-tauri/src/commands/file/helpers.rs:20-58`・`crates/nanai-core/src/surface_compositor.rs:130-164`・`ui/ts/surface/surface-compositor.ts:154-176` で実行（緑背景・右上色も追加透過）。ただしアニメ GIF/APNG/WebP 再生および暗号化 PNG (`DAP`/`DDP`/`DFP`/`DGP`)・GIF・JPEG は非対応 |
| `surface*.pna`（アルファチャンネル定義・非完全透明当たり判定・`seriko.use_self_alpha`） | ✅ 実装済 | `src-tauri/src/commands/file/surface_image.rs:149-191`（`load_surface_pna`）と `crates/nanai-core/src/surface_compositor.rs:166-175`・`ui/ts/surface/surface-compositor.ts:178-184` で PNA アルファ合成を実装。`seriko.use_self_alpha` は `ui/ts/surface/surface-manager.ts:917-929` と `ui/ts/surface/surface-render.ts:231-241` で参照し、非透明ピクセル判定は `ui/ts/surface/interaction/transparency.ts:10-50` で実装 |
| `(element).png`（任意名パーツ画像合成・SSP 2.7.38+ アニメ画像） | ⚠️ 一部対応 | `crates/nanai-core/src/surface_compositor.rs:80-106`・`crates/ui/src/shell/core.rs:159-165`・`src-tauri/src/commands/shell/manifest.rs:158`・`ui/ts/surface/surface-render.ts:200-223` で `element` レイヤー合成を実装。ただし Tauri 経路の `ui/ts/surface/ghost-surface-dom.ts:84-101` はファイル名から `^surface` を除いた ID で `load_surface_image` を呼ぶため、`surface*.png` 以外の任意ファイル名パーツを読み込めない（アニメ GIF/APNG/WebP も非対応） |
| `(element).pna`（element パーツごとの `.pna`） | ⚠️ 一部対応 | `ui/ts/surface/ghost-surface-dom.ts:90,99-106` で拡張子を `.pna` へ置換して読み込むが、Tauri 経路では `load_surface_pna` が `surface{id}.pna` のみ探索するため任意名 `(element).pna` は未解決 |
| `surfaces.txt`（ID・合成・アニメーション・当たり判定定義） | ✅ 実装済 | `crates/nanai-surface/src/parser/main_parser.rs:9`・`crates/nanai-core/src/surfaces_parser/parser/core.rs:12`・`crates/ui/src/shell/core.rs:48-60`・`ui/ts/surface/surface-manager.ts:780-911` でパースと適用を実装 |
| `surfaces**.txt`（SSP 専用・`surfaces2.txt` 等任意名定義） | ⚠️ 一部対応 | `crates/ui/src/shell/core.rs:62-68` と `crates/nanai-surface/src/types/txt/surfaces_txt/core/merge.rs:6` が `surfaces2.txt` のマージに対応（`crates/ui/src/shell/tests.rs:75`）。`surfaces2.txt` 以外の任意 `surfaces**.txt` 列挙および `surface-manager.ts:806` の直接読み込みフォールバックは未対応 |
| `alias.txt`（旧仕様 `sakura(kero).alias` ファイル） | ❌ 未実装 | `surfaces.txt` 内の `surface.alias` / `sakura.alias` / `kero.alias` は `crates/ui/src/shell/core.rs:89-91` で対応済みだが、単独ファイル `alias.txt` の読み込みは未実装 |
| `thumbnail.png`（メニュー用シェルサムネイル・png/jpg/pnr） | ❌ 未実装 | バルーン用サムネイル（`src-tauri/src/commands/shell/balloon.rs:110`）や着せ替えサムネイル（`ui/ts/surface/bind-menu.ts:14`）は実装されているが、シェル一覧用の `thumbnail.png` / `.jpg` / `.pnr` 読み込みは未実装 |
| `makoto.dll`（シェル側トランスレータ） | ❌ 未実装 | シェルフォルダ直下の `makoto.dll` 検出・DLL ロード・実行は未実装（`translator.md` 参照） |
| `surfacetable.txt`（SSP 専用・サーフィステスト等支援定義） | ⚠️ 一部対応 | `crates/ui/src/surfacetable/parser.rs:9`・`crates/ui/src/shell/core.rs:70-73,114-117`・`crates/ui/src/manifest/shell_manifest.rs:29` でパース・保持・名前解決を実装（`crates/ui/src/surfacetable/tests.rs`）しているが、フロントエンド UI（`ui/ts/`）での活用は未接続 |
| `menu_background.png` / `menu_foreground.png` / `menu_sidebar.png` | ⚠️ 一部対応 | `src-tauri/src/ghost/scan/shell/theme.rs` 等でシェルから読み込みメニューへ適用（詳細は [owner-draw-menu.md](owner-draw-menu.md) 参照） |

## 実装箇所

- `crates/ui/src/shell/core.rs:41` `pub fn load(directory: &Path) -> Result<Self, std::io::Error> {`
- `src-tauri/src/commands/file/surface_image.rs:11` `pub fn load_surface_image(`
- `src-tauri/src/commands/file/surface_image.rs:149` `pub fn load_surface_pna(`
- `src-tauri/src/commands/shell/manifest.rs:31` `pub fn shell_manifest(`
- `crates/nanai-core/src/surface_compositor.rs:109` `pub fn process_chroma_key_data(`
- `crates/ui/src/surfacetable/parser.rs:9` `pub fn parse_surface_table(text: &str) -> SurfaceTable {`
- `ui/ts/surface/surface-manager.ts:780` `async loadSurfacesTxt(`
- `ui/ts/surface/ghost-surface-dom.ts:40` `export async function applySurfaceImageToDom(`
- `ui/ts/surface/interaction/transparency.ts:10` `export function isPixelTransparent(`
- `tests/ghost-surface.test.ts:27` `if (cmd === "load_surface_image") {`
