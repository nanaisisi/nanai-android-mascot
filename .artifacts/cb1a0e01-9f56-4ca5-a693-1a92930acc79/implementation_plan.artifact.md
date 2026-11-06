# 事前ロード（Preload）改善計画および設計方針

アプリの初期起動時およびゴースト切り替え時における表示のチラつきや、ウィンドウ生成時のもたつき（レイテンシ）を解消するための、ウィンドウ・アセットの事前ロード（Preload）戦略の最適化計画。

---

## 1. アプリの初期読み込み (App Initial Boot Preloading)

### 目的
- アプリ起動直後にユーザーがトレイアイコンやゴーストをクリックした際、ウィンドウ生成（WebView初期化）のオーバーヘッドなしにメニューやバルーンが即座に表示されるようにする。

### 提案する改善策
1. **補助ウィンドウ群の非表示先行キャッシュ**:
   - `preload_auxiliary_windows` において、`menu_window`, `submenu_window`, `balloon_window_0`, `balloon_window_1` をバックグラウンドで非表示（`visible: false`）かつ適切なデフォルトサイズ（メニュー: 260x720, バルーン: 280x200）で生成。
2. **ローディングバナー・初期キャラクターの先行準備**:
   - 初期選択ゴーストの検出時、アセットアセットを読み込み終えるまでローディングバナーを表示し、メインキャラクターウィンドウのレンダリングを裏で非表示のまま完了させる。

---

## 2. ゴースト変更相当の読み込み (Ghost Switching Preloading)

### 目的
- ゴースト切り替え（`OnGhostChanged` / `selectGhost`）時、旧ゴーストを破棄する前に新ゴーストのアセット・SHIORI・サーフィスを裏で先行準備し、切り替え瞬間の画面黒塗りやアセット未読み込み（1頭身現象や崩れ）を完全に防止する。

### 提案する改善策
1. **新ゴーストアセットのバックグラウンド先行ロード**:
   - 切替先の新ゴーストの `descript.txt` / `surfaces.txt` / シェルマニフェスト、および `surface0.png` / `surface10.png`（または `tray.ico`）を非同期で先行パース・キャッシュ。
2. **ダブルバッファリング的切り替えフロー**:
   - 新ゴーストの SHIORI ロード (`load_ghost`) およびサーフィス画像デコードが完了したタイミングで、一括してウィンドウ画像更新 (`update-subchar-image`) とサイズ自動追従を行い、旧ゴースト表示からシームレスに切り替える。
3. **トレイアイコンの連動更新**:
   - 新ゴーストの `tray.ico` / `tray.png` を検出し、切り替え完了と同時にトレイアイコンを差し替える (`update_tray_icon_from_path`)。

---

## User Review Required

> [!IMPORTANT]
> 既存のすべての単体テスト（TS 570件・Rust 289件）のカバレッジを一切損なわずに、Tauri の Window Preload パイプラインおよび GhostController 側のプリロードロジックをリファクタリング・最適化します。

---

## Verification Plan

### Automated Tests
- `cargo test --package nanai-android-mascot-ui` (全 289 テスト通過)
- `npm test` (全 154 テストファイル / 570 テスト通過)

### Manual Verification
- デスクトップ環境 (`cargo tauri dev` / `cargo run`) でのアプリ初期起動時のトレイ・メニュー即時ポップアップ動作。
- メニューからのゴースト切替時におけるアセット・トレイアイコンのシームレスな切替確認。
