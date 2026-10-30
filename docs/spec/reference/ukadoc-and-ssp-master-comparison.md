# UKADOC Spec & SSP 標準仕様 総合対照マスター仕様書 (Master Comparison)

- **参照公式規格**:
  - [ukadoc-spec](https://github.com/ukatech/ukadoc-spec) (コア仕様・イベント・記述子・スクリプト)
  - [ukadoc-ssp](https://github.com/ukatech/ukadoc-ssp) (SSP標準設定・機能・ハウツー)
- **権利表記**: © UKADOC project / Ukagaka Tech Team (CC BY 4.0) / © PONapook 氏
- **管理・検証規定**: [厳密コード検証システム規定 (Strict Code Verification Protocol)](../developer/strict-code-verification-system.md)

本ドキュメントは、公式 **ukadoc-spec** と標準ベースウェア **ukadoc-ssp** の双方の仕様項目を対照させ、Nanai Android Mascot における実装状況と対応方針を網羅的に比較・記録するマスター対照表である。

---

## 1. コア仕様・プロトコル対照 (`ukadoc-spec` vs `ukadoc-ssp`)

| 分類領域                     | ukadoc-spec 対応モジュール                         | ukadoc-ssp 関連項目                                          | Nanai 実装・対応状況                                                                   |
| :--------------------------- | :------------------------------------------------- | :----------------------------------------------------------- | :------------------------------------------------------------------------------------- |
| **SHIORI プロトコル**        | `list/shiori-event/`, `spec/`                      | 設定・接続関連                                               | **✅ 100% 対応済** (SHIORI 3.0 / 2.x リクエスト・レスポンス・イベント発火)             |
| **SSTP 通信**                | `list/sakura-script/event/`                        | SSPメッセンジャ (`sspim/`)                                   | **✅ 完全対応済** (`SEND`, `EXECUTE`, `GIVE`, `COMMUNICATE`, `NOTIFY`, Keep-Alive)     |
| **さくらスクリプト**         | `list/sakura-script/` (balloon-text, choice, etc.) | 各種コマンドタグ                                             | **✅ 96% 対応済** (Rust 統一パーサー `crates/ui/src/script/`)                          |
| **サーフィス・シェル**       | `descript/shell/`, `spec/surfaces/`                | 設定：表示 (`config/disp.md`)                                | **✅ 完全対応済** (Seriko アニメーション、CollisionEx、メニュービットマップ)           |
| **ネットワーク更新**         | `descript/install/`, `list/sakura-script/misc/`    | 接続設定 (`config/conn2.md`), ハウツー (`howto/headline.md`) | **✅ 完全対応済** (`updates.txt`, `updates2.dau`, RSS/Atom ヘッドラインフィードパーサ) |
| **カレンダー・スケジュール** | `list/shiori-event/calendar/`                      | 機能：カレンダー (`functions/calendar/`)                     | **✅ 完全対応済** (永続スケジュール管理 `schedules.json`, イベント通知)                |
| **音声機能 (TTS/音声認識)**  | -                                                  | 機能：音声認識・合成 (`functions/speech-*.md`)               | **✅ 対応済** (`DictationManager` による Web Speech API 連携)                          |

---

## 2. 開発者ツール・拡張仕様対照

| 領域                       | ukadoc-spec 該当部分                        | ukadoc-ssp 該当部分                                          | Nanai 実装・対応方針                                 |
| :------------------------- | :------------------------------------------ | :----------------------------------------------------------- | :--------------------------------------------------- |
| **着せ替え**               | `descript/shell-surfaces/`                  | 開発者：着せ替え (`dev/bind.md`)                             | **✅ 対応済** (`surfaces.txt` パーサとレイヤー合成)  |
| **アーカイブ (NAR)**       | `descript/install/`                         | 開発者：NAR作成 (`dev/nar.md`)                               | **✅ 対応済** (NAR アーカイブ展開・VFS 解決)         |
| **オーナードローメニュー** | `list/shiori-resource/ownerdraw-item-name/` | 拡張仕様：メニュービットマップ (`extra-spec/menu-bitmap.md`) | **✅ 対応済** (カスタムテーマ・ビットマップ背景適用) |
