# ukadoc-spec/dev (開発者向け詳細・実例: nar, bind, ownerdraw, update, shell) 規格適合確認文書

- **言及規の元ドキュメント・権利者・ライセンス**:
  - **ukadoc-spec/dev**: [ukatech/ukadoc-spec](https://ukatech.shillest.net/ukadoc-spec/) - © UKADOC project / Ukagaka Tech Team (CC BY 4.0)

Nanai Android Mascot における、ukadoc-spec の `dev/` ディレクトリに含まれる詳細実例解説（`nar.md`, `bind.md`, `ownerdraw.md`, `update.md`, `shell.md`, `shell-error.md`）に対する適合確認文書である。

---

## 1. dev 配下の詳細実例別適合状況

| ukadoc-spec/dev 項目                                      | 対象詳細実例・仕様                                                                      |  対応度  | Nanai における実装・対応内容                                                                            |
| :-------------------------------------------------------- | :-------------------------------------------------------------------------------------- | :------: | :------------------------------------------------------------------------------------------------------ |
| **NAR アーカイブ作成** (`dev/nar.md`)                     | 配布用ファイル構成、初期 updates2.dau、install.txt 準備、不要ファイル除外               | **95%**  | マルチアーカイブ導入（ghost, balloon, shell, plugin, headline）、`.dev_ignore` 制御。                   |
| **着せ替え (Bind)** (`dev/bind.md`)                       | surfaces.txt の `interval,bind`、descript.txt の `bindgroup`・`menuitem` 配置、排他制御 | **95%**  | `bindgroup` パース、メニューUI動的描画、`mustselect` 排他制御、`\![bind]` スクリプトタグ完全対応。      |
| **オーナードローメニュー詳細** (`dev/ownerdraw.md`)       | 背景 (`menu.*.bitmap`), フォントカラー, サイドバービットマップ, アライメント設定        | **100%** | `menu.*.bitmap` の動的抽出、Tauri 安全URL変換、CSS変数・サイドバーレイアウトによる完全再現。            |
| **ネットワーク更新実例** (`dev/update.md`)                | updates2.dau 差分検知、クライアント更新シーケンス (`OnUpdate*`)                         | **92%**  | `OnUpdate*` シーケンス、ファイル単位進捗、`OnUpdateResultExplorer`、updates2.dau 差分ダウンロード完備。 |
| **シェル仕様・エラー** (`dev/shell.md`, `shell-error.md`) | surfaces.txt アニメーション・当たり判定 (`collision`/`collisionex`), エラーハンドリング | **95%**  | Canvas 2D 合成、circle/ellipse 判定、SERIKO アニメーション、堅牢なフォールバック。                      |
