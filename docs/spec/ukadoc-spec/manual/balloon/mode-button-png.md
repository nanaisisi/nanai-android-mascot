# `mode_down.png / mode_up.png`

- **規格**: [balloon.md](../../../../ukadoc-spec/manual/balloon.md) ([公式版](https://ukatech.shillest.net/ukadoc-spec/manual/balloon/))
- **検索語**: mode_down.png, mode_up.png
- **対応状況**: ⚠️ 一部対応

## 突合結果

`docs/ukadoc-spec/manual/balloon.md` で定義されるモード切替ボタン画像 `mode_down.png` / `mode_up.png`（SSP 専用）のうち、`mode_button` の外部ファイル解決（`resolve_balloon_ui_asset` / `load_balloon_ui_asset`）および CSS カスタムプロパティ `--balloon-mode-button-image` へのバインディングは実装済み。ボタン UI の描画は未実装。

## 実装箇所

- `src-tauri/src/commands/shell/balloon.rs` (`resolve_balloon_ui_asset`, `load_balloon_ui_asset`)
- `ui/ts/core/actions/balloon-descript/assets.ts` (`--balloon-mode-button-image`)

## 追記 (resolver)

- ファイル解決は `resolve_balloon_ui_asset` (`src-tauri/src/commands/shell/balloon.rs`) で実装済み。スコープ別 (s/k/pN) → 無印の順に外部ファイルを探索し、単体テスト `ui_asset_tests` で検証。
- ボタン UI の描画は SSP 専用の入力ボックス機能に依存するため本プラットフォームでは未実装 (対応状況は据え置き)。
