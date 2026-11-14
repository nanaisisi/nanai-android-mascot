# JavaScript 大規模ファイルのモジュール化計画

プロジェクト内の肥大化したフロントエンド JavaScript ファイル（10KB〜28KB超）を、関心の分離（SoC）と保守性向上のために論理的な小規模 ES モジュール群へ分割・再構成します。

## ユーザーレビュー確認事項

> [!IMPORTANT]
> 既存の公開 API や外部呼び出し（Tauriコマンド・UIコントローラー間のメソッドバインディングなど）の互換性を完全に維持するため、各モジュールのエントリポイント（例: `app-actions.js`, `surface-render.js` 等）は再エクスポート（re-export）構造を採用し、既存のインポート元への影響を最小限に抑えます。

## 対象ファイルと分割方針

### 1. `ui/js/core/app-actions.js` (約 28.6 kB)
- **役割**: メニューアクション処理、バルーン設定、ネットワーク更新、ゴースト切り替え等の総合ディスパッチャ。
- **分割案**:
  - `ui/js/core/actions/balloon-actions.js`: バルーンテーマ、DPI、スケール、位置リセット関連
  - `ui/js/core/actions/ghost-actions.js`: ゴースト再読み込み、情報表示、シェル位置リセット関連
  - `ui/js/core/actions/network-actions.js`: ネットワーク更新・チェック関連
  - `ui/js/core/app-actions.js`: 上記を統合してディスパッチするメインエントリ

### 2. `ui/js/surface/surface-animation-manager.js` (約 17.6 kB) & `surface-render.js` (約 15.3 kB) & `ghost-surface.js` (約 10.9 kB)
- **役割**: サーフィスアニメーション制御、描画、サーフィス状態管理。
- **分割案**:
  - `ui/js/surface/surface-types.js`: 定数・データ構造定義
  - `ui/js/surface/surface-render.js`: 描画コアロジック
  - `ui/js/surface/surface-animation-manager.js`: アニメーションフレーム・タイマー管理
  - `ui/js/surface/ghost-surface.js`: サーフィス状態とレイヤー管理

### 3. `ui/js/ui/submenu.js` (約 14.5 kB), `modal-ghost-handlers.js` (約 13.7 kB), `menu-submenu-renderer.js` (約 13.4 kB)
- **役割**: メニュー、サブメニュー、モーダルダイアログの表示・ハンドリング。
- **分割案**:
  - `ui/js/ui/submenu.js`: サブメニュー制御
  - `ui/js/ui/menu-submenu-renderer.js`: メニュー描画・レンダリング
  - `ui/js/ui/modal-ghost-handlers.js`: モーダルおよびゴースト関連ダイアログハンドラ

### 4. `ui/js/ghost/sakura-play.js` (約 11.7 kB)
- **役割**: さくらスクリプトの再生・文字送り制御。
- **分割案**:
  - `ui/js/ghost/sakura-parser.js`: トークン解析・エスケープ処理
  - `ui/js/ghost/sakura-play.js`: タイムライン再生・ウェイト制御メイン

---

## 検証計画

- **構文・ビルド確認**: JavaScriptのインポート/エクスポートエラーがないことの確認。
- **動作確認**: UIメニュー操作、サーフィスアニメーション、バルーン表示・DPI設定、ゴースト対話が正常に動作することの確認。
