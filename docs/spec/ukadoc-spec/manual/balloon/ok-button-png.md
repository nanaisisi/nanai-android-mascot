# `ok_down.png / ok_up.png`

- **規格**: [balloon.md](../../../../ukadoc-spec/manual/balloon.md) ([公式版](https://ukatech.shillest.net/ukadoc-spec/manual/balloon/))
- **検索語**: ok_down.png, ok_up.png
- **対応状況**: ✅ 対応済み

## 突合結果

`docs/ukadoc-spec/manual/balloon.md` で定義される入力ボックス系 OK ボタン画像 `ok_down.png` / `ok_up.png`（SSP 専用）について、`ok_button` の外部ファイル解決（`resolve_balloon_ui_asset` / `load_balloon_ui_asset`）、CSS カスタムプロパティ `--balloon-ok-button-image` へのバインディング、および `ui/ts/ghost/command-handler/inputbox.ts`・`communicatebox.ts`・`teachbox.ts` のボタン要素（`.balloon-ok-btn`）への描画を実装済み。

## 実装箇所

- `src-tauri/src/commands/shell/balloon.rs` (`resolve_balloon_ui_asset`, `load_balloon_ui_asset`)
- `ui/ts/core/actions/balloon-descript/assets.ts` (`--balloon-ok-button-image`)
- `ui/css/balloon-window.css` (`.balloon-ok-btn`)
- `ui/ts/ghost/command-handler/communicatebox.ts` / `inputbox.ts` / `teachbox.ts` (`.balloon-ok-btn`)

## 追記 (resolver)

- ファイル解決は `resolve_balloon_ui_asset` (`src-tauri/src/commands/shell/balloon.rs`) で実装済み。スコープ別 (s/k/pN) → 無印の順に外部ファイルを探索し、単体テスト `ui_asset_tests` で検証。
