# Android 全キャラ単一ウインドウ統合表示

Android オーバーレイで、メイン (scope 0) とサブキャラを 1 つのオーバーレイウインドウにまとめて表示する opt-in モード。

## 設定

- 設定キー: `androidOverlayUnified`（既定 `false`、localStorage に永続化）
- 設定モーダルのチェックボックスで切り替える。
- 保存時に `nam:android:overlay-unified-request` が発火し、`OverlayManager.setUnified` が反映され `nam:android:overlay-unified-changed` が通知される。

## レイアウト

- 実装: `ui/ts/ui/touch/bridge/unified-layout.ts` の `computeUnifiedLayout`
- 可視キャラを左から右へ横並び、下端揃え、間隔 8px。各キャラのサーフェスサイズ × スケールを使用する。
- 合計サイズを Tauri コマンド `resize_overlay_window(width, height)` に渡す。
- 無効時は従来どおり 1 キャラ 1 ウインドウで、挙動は変わらない。

## 関連仕様

- [android-window-architecture.md](./android-window-architecture.md) - Android ウインドウアーキテクチャおよびオーバーレイ提供計画（個別／統合モードの位置づけ、ネイティブオーバーレイ構成、ワークエリア基準、メニュー維持方針）

## 未実装・注意

- `resize_overlay_window` のネイティブ側（`OverlayWindowController` / `CharacterOverlayWindow` による統合レイアウト反映）は計画段階であり、実機での動作確認は未実施。
