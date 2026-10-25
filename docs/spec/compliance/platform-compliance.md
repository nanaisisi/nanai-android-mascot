# プラットフォーム規格対応仕様 (Platform Compliance)

- **言及規格の元ドキュメント・権利者・ライセンス**:
  - **SSP 互換拡張 / ポップアップメニュー規格**: [SSP BUG-SLIK-PRACTICE / 仕様リファレンス](http://ssp.shillest.net/) - © PONapook 氏 / SSP開発チーム (SSP リファレンス仕様)
  - **surfaces.txt / アニメーション合成 / 当たり判定**: [ukadoc: surfaces.txt](https://ukatech.shillest.net/ukadoc-spec/spec/surfaces/) - © MATERIA開発チーム / SSP開発チーム / ukadoc プロジェクト (ukadoc 仕様 / パブリックリファレンス)

Nanai Android Mascot における「Windows」および「Android」プラットフォーム要件・OS規格への個別対応仕様です。

## 1. 概要と対応度

- **規格**: Tauri v2, Windows Desktop, Android API 26+ (Overlay / Foreground Service)
- **対応度**: **75%**
- **主要実装ファイル**:
  - `src-tauri/tauri.conf.json`: ウィンドウ透過・リサイズ・セキュリティ権限
  - `src/js/interaction.js`: マウス/タッチハイブリッド操作制御
  - `docs/spec/android-overlay-and-service-spec.md`: Android 常駐・オーバーレイ仕様

---

## 2. プラットフォーム別対応状況

### 2.1 Windows (デスクトップ環境)

| 機能要件 | 対象仕様 | 対応状況 | 動作仕様・実装詳細 |
| :--- | :--- | :---: | :--- |
| **透過ウィンドウ** | 背景アルファ透過 | ✅ 対応済 | `transparent: true` による完全透過描画 |
| **クリックスルー** | 非描画領域の透過 | ✅ 対応済 | ポインタ透過制御（CSS `pointer-events: none` / Tauri 側ヒットテスト） |
| **ウィンドウ移動** | タイトルバーなしドラッグ | ✅ 対応済 | キャラクター領域ドラッグによるウィンドウスムーズ追従 |
| **右クリックメニュー** | コンテキストメニュー | ✅ 対応済 | キャラクター右クリックでの iframe 隔離メニュー展開 |
| **キーボードショートカット** | `Ctrl+W`, `Ctrl+Q` 等 | ✅ 対応済 | 標準アクセラレータキーによる終了・操作 |

### 2.2 Android (モバイル環境)

| 機能要件 | 対象仕様 | 対応状況 | 動作仕様・実装詳細 |
| :--- | :--- | :---: | :--- |
| **タッチ操作** | タッチドラッグ / タップ判定 | ✅ 対応済 | タッチスワイプによる移動、タップによる当たり判定イベント発火 |
| **ドッキング退避** | 画面端スナップ | ✅ 対応済 | 画面端フリックで半透明タブに退避、他アプリ使用を阻害しない設計 |
| **フォアグラウンドサービス** | 常駐・通知エリア連携 | 🚧 開発中 | バックグラウンドキルを防ぐ Foreground Service パッケージング |
| **最前面オーバーレイ** | `SYSTEM_ALERT_WINDOW` | 🚧 開発中 | 他アプリ最前面での常時表示パーミッション管理 |
| **省電力・Dozeモード対策** | バッテリー最適化除外 | 🚧 計画中 | バックグラウンド通信・時報タイマーの持続性確保 |
