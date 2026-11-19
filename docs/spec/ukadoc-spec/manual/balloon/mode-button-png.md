# `mode_down.png / mode_up.png`

- **規格**: [balloon.md](../../../../ukadoc-spec/manual/balloon.md) ([公式版](https://ukatech.shillest.net/ukadoc-spec/manual/balloon/))
- **検索語**: mode_down.png, mode_up.png
- **対応状況**: ❌ 未実装

## 突合結果

`docs/ukadoc-spec/manual/balloon.md` で定義されるモード切替ボタン画像 `mode_down.png` / `mode_up.png`（SSP 専用）の読み込みおよび描画は未実装。

## 実装箇所

実装コード内に「mode_down.png, mode_up.png」は検出されませんでした。

## 追記 (resolver)

- ファイル解決は `resolve_balloon_ui_asset` (`src-tauri/src/commands/shell/balloon.rs`) で実装済み。スコープ別 (s/k/pN) → 無印の順に外部ファイルを探索し、単体テスト `ui_asset_tests` で検証。
- ボタン UI の描画は SSP 専用の入力ボックス機能に依存するため本プラットフォームでは未実装 (対応状況は据え置き)。
