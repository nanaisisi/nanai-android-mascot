# `clickwait.png / clickwaits*.png / clickwaitk*.png / clickwaitp*def.png`

- **規格**: [balloon.md](../../../../ukadoc-spec/manual/balloon.md) ([公式版](https://ukatech.shillest.net/ukadoc-spec/manual/balloon/))
- **検索語**: clickwaits, clickwaitk, clickwaitp
- **対応状況**: ❌ 未実装

## 突合結果

`docs/ukadoc-spec/manual/balloon.md` で定義されるクリック待ち（`\x`）表示用標準画像 `clickwait.png` / `clickwaits*.png` / `clickwaitk*.png` / `clickwaitp*def.png`（SSP 2.5.54〜専用）の自動解決および `\x` 待機中のクリック待ちマーカー表示は未実装（実装コード内に「clickwaits」「clickwaitk」「clickwaitp」は検出されませんでした）。`applyAssetProperties` (`ui/ts/core/actions/balloon-descript/assets.ts:248,414-420`) は `descript.txt` 等で明示指定された `clickwaitmarker.filename` / `clickwaitmarker.x` / `y` を CSS 変数 `--balloon-clickwait-image` 等に設定するのみで、`ui/css/balloon-window.css:331-351` に `.clickwait-marker`、Rust パーサー (`crates/ui/src/script/command.rs:10`, `ui/ts/ghost/sakura-rust-bridge.ts:238`) に `ClickWait` トークンがあるものの、`SakuraScriptPlayer` (`ui/ts/ghost/sakura-script.ts`) 側での要素生成は未実装である。

## 実装箇所

- `ui/ts/core/actions/balloon-descript/assets.ts:248` `setBalloonImage("clickwaitmarker.filename", "--balloon-clickwait-image");`
- `ui/ts/core/actions/balloon-descript/assets.ts:415` `const cwX = parseInt(props["clickwaitmarker.x"], 10);`
- `ui/css/balloon-window.css:331` `.clickwait-marker {`
- `crates/nanai-core/src/balloon_descript.rs:121` `pub fn click_wait_marker_filename(&self) -> Option<&str> {`
- `ui/ts/ghost/sakura-rust-bridge.ts:238` `case "ClickWait":`

## 追記 (resolver)

- ファイル解決は `resolve_balloon_ui_asset` (`src-tauri/src/commands/shell/balloon.rs`) で実装済み。スコープ別 (s/k/pN) → 無印の順に外部ファイルを探索し、単体テスト `ui_asset_tests` で検証。
- ボタン UI の描画は SSP 専用の入力ボックス機能に依存するため本プラットフォームでは未実装 (対応状況は据え置き)。
