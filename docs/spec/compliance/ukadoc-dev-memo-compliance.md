# 開発者ガイド・メモ仕様対応文書 (UKADOC Dev & Memo Compliance)

- **参照公式規格**: [ukatech/ukadoc-spec](https://github.com/ukatech/ukadoc-spec) (`dev/`, `memo/`)
- **権利表記**: © UKADOC project / Ukagaka Tech Team (CC BY 4.0)
- **管理・検証規定**: [厳密コード検証システム規定 (Strict Code Verification Protocol)](../developer/strict-code-verification-system.md)

本ドキュメントは、UKADOC 規格の **開発者向け解説（`dev/`）** および **開発メモ（`memo/`）** における各仕様項目（着せ替え定義、NARアーカイブ、オーナードローメニュー、シェルサーフィス、ネットワーク更新、SHIORIイベントメモ等）に対する Nanai Android Mascot の対応状況と実装方針を記録した公式文書である。

---

## 1. 開発者ガイド (`dev/`) 対応マトリクス

| 規格ファイル (`ukadoc-spec/dev/`) | 対象領域・機能                                       |   対応状況    | Nanai における実装・対応方針                                                           |
| :-------------------------------- | :--------------------------------------------------- | :-----------: | :------------------------------------------------------------------------------------- |
| **`bind.md`**                     | 着せ替え定義 (`bindgroup`, `bindoption`)             | **✅ 対応済** | `surfaces.txt` パーサおよび `surface-dressup.js` による着せ替えレイヤー合成。          |
| **`nar.md`**                      | NAR アーカイブ構造・パッケージング                   | **✅ 対応済** | `.nar` 抽出・ZIP 展開処理 (`src-tauri/src/commands/install/` および VFS 解決)。        |
| **`ownerdraw.md`**                | オーナードローメニュー仕様                           | **✅ 対応済** | メニューテーマ、背景・サイドバービットマップ適用 (`submenu.js`, `menu-renderers.js`)。 |
| **`shell.md` / `shell-error.md`** | シェル構造、サーフィス定義、アニメーション           | **✅ 対応済** | `surfaces.txt` パーサ、Seriko アニメーションエンジン、パレット・カラーブレンド合成。   |
| **`update.md`**                   | ネットワーク更新仕様 (`updates.txt`, `updates2.dau`) | **✅ 対応済** | 更新定義パーサ (`src-tauri/src/update/`) およびネットワーク更新進行管理。              |

---

## 2. 開発メモ (`memo/`) 対応マトリクス

| 規格ファイル (`ukadoc-spec/memo/`) | 対象領域・機能           |   対応状況    | Nanai における実装・対応方針                                           |
| :--------------------------------- | :----------------------- | :-----------: | :--------------------------------------------------------------------- |
| **`memo.md`**                      | 一般開発メモ・設計ノート | **✅ 対応済** | クロスプラットフォーム（Android / デスクトップ）共通コア設計への反映。 |
| **`shiori-event.md`**              | SHIORI イベント解説メモ  | **✅ 対応済** | SHIORI 3.0 / 2.x イベントディスパッチ・通知システムの網羅的実装。      |

---

## 3. 実装のポイント

1. **着せ替えとシェル構造 (`dev/bind.md`, `dev/shell.md`)**:
   - ゴーストのシェルが持つ `surfaces.txt` と `descript.txt` を厳密に解析し、着せ替えパーツ（`bindgroup`）やアニメーション定義をサーフィスコンポジターへ反映。
2. **ネットワーク更新 (`dev/update.md`)**:
   - `updates.txt` および `updates2.dau` の区切り文字パース（カンマ/タブ/バイト1文字）を完全網羅し、安全な差分更新を実施。
3. **SHIORI イベントメモ (`memo/shiori-event.md`)**:
   - 起動、終了、マウス操作、タイマー、通信等の標準・拡張イベントを非同期でディスパッチ。
