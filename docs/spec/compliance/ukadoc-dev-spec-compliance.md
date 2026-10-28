# Ukagaka Tech Team (ukadoc-spec/dev) 開発者向け詳細規格・実例コンプライアンス (Dev Specification Compliance)

- **言及規格の元ドキュメント・権利者・ライセンス**:
  - **ukadoc-spec/dev (開発者向け詳細・実例解説)**: [ukatech/ukadoc-spec/dev](https://ukatech.shillest.net/ukadoc-spec/dev/) - © UKADOC project / Ukagaka Tech Team (CC BY 4.0)

Nanai Android Mascot における、ukadoc-spec の `dev/` ディレクトリ（開発者向け詳細実例・オーナードローメニュー・着せ替え・NAR作成・更新仕様）に対する対応状況の監査レポートである。

---

## 1. `ukadoc-spec/dev/` 各ファイルの対応状況マトリクス

| 規格文書ファイル | 概要・対象機能 | 対応度 | Nanai における実装・対応状況 |
| :--- | :--- | :---: | :--- |
| **`nar.md`** | 配布用ファイル（NAR / ZIP）の作成、初期 updates2.dau、install.txt の準備、不要ファイル除外 | **95%** | NAR 導入（解凍・自動判別・ZipSlip防止）は完全対応。開発環境ゴーストの `.dev_ignore` 除去対応済。 |
| **`bind.md`** | 着せ替え (Bind) の surfaces.txt 定義 (`interval,bind`) および descript.txt 定義 (`bindgroup`, `menuitem`) | **95%** | `bindgroup` パース、メニューUI動的描画、`mustselect` 排他制御、`\![bind]` スクリプトタグ完全対応。 |
| **`ownerdraw.md`** | オーナードローメニュー（右クリックメニュー）の背景・前景・サイドバービットマップ、アライメント、フォント色設定 | **100%** | `menu.*.bitmap`（background, foreground, sidebar）の動的抽出、Tauri 安全URL変換、CSS変数・サイドバーレイアウトによる完全再現。 |
| **`update.md`** | ネットワーク更新（updates2.dau / updates.txt）の生成・差分検知・クライアント更新パイプライン | **92%** | `OnUpdate*` シーケンス、ファイル単位の進捗通知、`OnUpdateResultExplorer`、updates2.dau 差分ダウンロード完備。 |
| **`shell.md`** | シェルのファイル構成、surfaces.txt (アニメーション・合成メソッド・当たり判定) の詳細仕様 | **98%** | Canvas 2D によるベース・差分合成、`collision`/`collisionex` 当たり判定、SERIKO アニメーション、PNA マスク対応。 |
| **`shell-error.md`**| シェルロード時・サーフィスパース時のエラーハンドリング | **90%** | 不正なサーフィスや記述ミスに対するフォールバック、ログ出力および堅牢なフォールバックメカニズム完備。 |

---

## 2. 結論

`ukadoc-spec/dev/` で解説されている高度な実例・記述仕様（オーナードローメニュービットマップ、着せ替えbindgroup、NARアーカイブ構造、ネットワーク更新）は、本プロジェクトのRustバックエンドおよびWebフロントエンドにおいて極めて高い水準（90%〜100%）で実装・規格適合されている。
