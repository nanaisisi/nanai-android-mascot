# バルーン (manual/balloon.md)

- **規格**: [balloon.md](../../../ukadoc-spec/manual/balloon.md) ([公式版](https://ukatech.shillest.net/ukadoc-spec/manual/balloon/))
- **検索語**: load_balloon_image
- **対応状況**: ⚠️ 一部対応

バルーンフォルダのファイル構成（`descript.txt`、バルーン画像、PNA マスク、サーフェス別オプション `*s.txt`、スクロール矢印・マーカー・ボタン画像・サムネイル等）に対する実装状況。`descript.txt`・`balloons*.png`・`balloonk*.png`・`.pna`・`arrow0/1`・`arrows/arrowk`・`markers/markerk/marker` は読み込まれる一方、`balloonp*def*` の命名規約、`balloonc*`（入力ボックス背景スキン）、`clickwait*` 自動解決、`ok_down/up`・`cancel_down/up`・`mode_down/up` 等は一部未対応または未実装。

| 仕様項目 | 対応状況 | 実装・備考 |
| :--- | :---: | :--- |
| `descript.txt` | ✅ 実装済 | `balloon_descript_map` / `balloon_manifest` (`src-tauri/src/commands/shell/balloon.rs`) でパースし、`applyBalloonDescript` (`ui/ts/ghost/balloon-window/theme.ts`) でフォント・色・`validrect`・`wordwrappoint`・カーソル等を適用。`validate_balloon_descript` (`crates/nanai-core/src/balloon_descript.rs`) で推奨ゴーストも判定。 |
| `balloons*s.txt` / `balloonk*s.txt` | ⚠️ 一部対応 | `balloon_manifest` (`src-tauri/src/commands/shell/balloon.rs`) で `balloons0s.txt` / `balloonk0s.txt` / `balloonss.txt` / `balloonks.txt` / `balloons<id>s.txt` 等をマージ。`parse_balloon_options_text` (`crates/nanai-core/src/balloon_descript.rs`) も存在するが、無印バルーンID未指定時に `{prefix}{surf}{sid}s.txt` 形式を探す点が仕様と異なる。 |
| `balloonp*def*s.txt` | ❌ 未実装 | `balloon_manifest` (`src-tauri/src/commands/shell/balloon.rs`) は `scope_id == 1` (`balloonk`) とそれ以外 (`balloons`) のみ分岐し、`balloonp*def*s.txt` は未探索。 |
| `balloonc*s.txt` | ❌ 未実装 | `balloon_manifest` および入力ボックス (`ui/ts/ghost/command-handler/inputbox.ts`, `communicatebox.ts`, `teachbox.ts`) で未参照。 |
| `readme.txt` | ⚠️ 一部対応 | `scan_balloons` / `get_balloon_readme` (`src-tauri/src/commands/shell/balloon.rs`) で `readme.txt` / `Readme.txt` / `README.TXT` を読み込み可能。UI 側 (`ui/ts/ui/modal-ghost-handlers.ts`) からの表示呼び出しは未連携。 |
| `balloons*.png` | ✅ 実装済 | `loadBalloonSkinImages` (`ui/ts/ghost/balloon-window/theme.ts`) が `balloons{id}.png` / `balloons0.png` / `balloons1.png` / `balloons2.png` / `balloons.png` を `load_balloon_image` 経由で取得し、`--balloon-bg-image` (`ui/css/balloon-window.css`) に適用（9-slice `border-image` ではなく CSS `background-image` 全幅描画）。 |
| `balloons*.pna` | ✅ 実装済 | `loadBalloonSkinImages` (`ui/ts/ghost/balloon-window/theme.ts`) で対応する `.pna` を取得し、`processChromaKey` (`ui/ts/surface/surface-compositor.ts`) でアルファ合成。 |
| `balloonk*.png` | ✅ 実装済 | `scopeId === 1` 時に `balloonk{id}.png` / `balloonk0.png` / `balloonk1.png` / `balloonk2.png` / `balloonk3.png` / `balloonk.png` を解決 (`ui/ts/ghost/balloon-window/theme.ts`)。 |
| `balloonk*.pna` | ✅ 実装済 | `balloonk*.png` と対になる `.pna` を `load_balloon_image` + `processChromaKey` でアルファ合成 (`ui/ts/ghost/balloon-window/theme.ts`)。 |
| `balloonp*def*.png` | ⚠️ 一部対応 | `scopeId >= 2` 時に `balloonp{scopeId}_{id}.png` / `balloonp{scopeId}.png` / `balloonp{scopeId}_0.png` を探索し、仕様の `balloonp*def*.png` 命名規約と不一致（未検出時は `balloons0.png` へフォールバック）。 |
| `balloonp*def*.pna` | ⚠️ 一部対応 | ロードされた `balloonp*` ファイルの拡張子を `.pna` 置換して読み込むが、本体 PNG 側のファイル名不一致により `balloonp*def*.pna` 自体は未解決。 |
| `balloonc*.png` (`balloonc0`〜`balloonc5`) | ❌ 未実装 | `loadBalloonSkinImages` (`ui/ts/ghost/balloon-window/theme.ts`) が `"balloonc0.png"` のプリロード呼び出しのみ行い戻り値を使用せず、`balloonc1.png`〜`balloonc5.png` や入力ボックスへの背景画像適用は未実装。 |
| `balloonc*.pna` | ❌ 未実装 | 入力ボックス向け `.pna` マスク読み込み・合成は未実装。 |
| `online*.png` | ⚠️ 一部対応 | `applyAssetProperties` (`ui/ts/core/actions/balloon-descript/assets.ts`) で `onlinemarker.filename` / `interval` / `x` / `y` を読み、`loadBalloonSkinImages` で `online0.png` のみプリロードするが、`--balloon-online-image` を描画する CSS/DOM と連番アニメーションは未実装。 |
| `arrow0.png` / `arrow1.png` (`arrow*.png`) | ✅ 実装済 | `applyBalloonDescript` (`ui/ts/ghost/balloon-window/theme.ts`) で `arrow0.png` / `arrow1.png`（および `.pna`）を `--balloon-arrow0-image` / `--balloon-arrow1-image` に設定し、`.balloon-scroll-arrow-up` / `.balloon-scroll-arrow-down` (`ui/css/balloon-window.css`, `ui/ts/ghost/balloon-window.ts`) で描画。 |
| `arrows0.png` / `arrows1.png` / `arrowk0.png` / `arrowk1.png` / `arrowp*def0.png` / `arrowp*def1.png` | ⚠️ 一部対応 | `applyAssetProperties` (`ui/ts/core/actions/balloon-descript/assets.ts`) で `arrows0/1.png`（scope 0）と `arrowk0/1.png`（scope 1）を解決。`scopeId >= 2` は `arrowp{scopeId}0/1.png` を探索するため `arrowp*def0/1.png` と不一致。 |
| `sstp.png` | ⚠️ 一部対応 | `applyAssetProperties` (`ui/ts/core/actions/balloon-descript/assets.ts`) で `--balloon-sstpmarker-image` のフォールバック候補として読み込み、`ui/css/balloon-window.css` に `.sstp-marker` が定義されているが、SSTP 受信時の `.sstp-marker` DOM 生成は未実装。 |
| `thumbnail.png` (PNG / JPG / `.pnr` 透過) | ⚠️ 一部対応 | `scan_balloons` (`src-tauri/src/commands/shell/balloon.rs`) で `thumbnail.png` / `thumbnail.jpg` / `thumbnail.bmp` を読み込み、バルーン選択画面 (`ui/ts/ui/modal-ghost-handlers.ts`) に表示。`.pnr` リネームによる左上 1px 透過は未対応（JPG も `image/png` MIME 扱い）。 |
| `ok_down.png` / `ok_up.png` | ❌ 未実装 | 入力ボックス OK ボタン画像の読み込み・描画は未実装。 |
| `cancel_down.png` / `cancel_up.png` | ❌ 未実装 | 入力ボックスキャンセルボタン画像の読み込み・描画は未実装。 |
| `mode_down.png` / `mode_up.png` | ❌ 未実装 | モード切替ボタン画像の読み込み・描画は未実装。 |
| `sstp_new.png` / `sstp_newk.png` / `sstp_newp*def.png` | ⚠️ 一部対応 | `applyAssetProperties` (`ui/ts/core/actions/balloon-descript/assets.ts`) でスコープ別に `sstp_new.png` / `sstp_newk.png` / `sstp_newp{scopeId}def.png` を読み `--balloon-sstpmarker-image` に設定するが、DOM 描画は未連携。 |
| `marker.png` / `markers.png` / `markerk.png` / `markerp*def.png` | ✅ 実装済 | `applyAssetProperties` (`ui/ts/core/actions/balloon-descript/assets.ts`) でスコープ別に探索して `--balloon-marker-image` に設定し、`\![*]` 実行時に `<span class="balloon-marker">` (`ui/ts/ghost/sakura-script.ts`, `ui/css/balloon-window.css`) として描画。 |
| `clickwait.png` / `clickwaits*.png` / `clickwaitk*.png` / `clickwaitp*def.png` | ❌ 未実装 | `clickwaitmarker.filename` 指定時のみ CSS 変数を設定し (`ui/ts/core/actions/balloon-descript/assets.ts`)、標準ファイル名 (`clickwait*.png`) の自動探索および `\x` 待機時の `.clickwait-marker` DOM 生成は未実装。 |

## 実装箇所

- `src-tauri/src/commands/shell/balloon.rs:36` `pub fn scan_balloons(app_handle: tauri::AppHandle) -> Result<Vec<BalloonInfo>, String> {`
- `src-tauri/src/commands/shell/balloon.rs:181` `pub fn balloon_manifest(`
- `src-tauri/src/commands/shell/balloon.rs:281` `pub fn load_balloon_image(`
- `crates/nanai-core/src/balloon_descript.rs:137` `pub fn parse_balloon_options_text(content: &str) -> BalloonOptionsManifest {`
- `ui/ts/ghost/balloon-window/theme.ts:173` `export async function loadBalloonSkinImages(`
- `ui/ts/core/actions/balloon-descript/assets.ts:102` `export function applyAssetProperties(`
