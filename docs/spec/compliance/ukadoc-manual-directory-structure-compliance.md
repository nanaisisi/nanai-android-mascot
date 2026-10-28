# ukadoc-spec/manual (ディレクトリ構造・全体構成マニュアル) 規格適合確認文書

- **言及規格の元ドキュメント・権利者・ライセンス**:
  - **ukadoc-spec/manual**: [ukatech/ukadoc-spec](https://ukatech.shillest.net/ukadoc-spec/) - © UKADOC project / Ukagaka Tech Team (CC BY 4.0)

Nanai Android Mascot における、ukadoc-spec の `manual/` ディレクトリ（ゴースト・シェル・バルーンの全体ディレクトリ構造、ファイル構成、インストール手順）に対する適合確認文書である。

---

## 1. manual 配下の構造・ガイド別の適合状況

| 規格カテゴリ (`manual/`) | 対象マニュアル・ガイド | 対応度 | Nanai における実装・対応内容 |
| :--- | :--- | :---: | :--- |
| **全体の構成** (`manual/directory.md`) | ゴースト、シェル、バルーンの標準フォルダ階層 (`ghost/master/`, `shell/master/`, `balloon/`) | **98%** | VFS およびスキャンモジュール (`scan_ghost_directory`, `scan_shells_from_ghost`) において標準ディレクトリ階層を完全に前提として走査。 |
| **ゴースト構成** (`manual/ghost.md`) | ゴーストフォルダ直下の配置、SHIORI DLL、デスクトップインテグレーション | **95%** | ネイティブ DLL / .so のロード、`descript.txt` 読み込み、複数ゴースト管理対応。 |
| **シェル構成** (`manual/shell.md`) | シェルフォルダの配置、`surfaces.txt`, 画像アセット, メニュー定義 | **98%** | Canvas 2D によるサーフィス描画、アニメーション、PNAマスク、`menu.*.bitmap` の動的適用。 |
| **オーナードローメニュー** (`manual/owner-draw-menu.md`) | 右クリックメニューの仕様とリソース定義 | **90%** | iframe 隔離メニュー、アクセラレータキー、シェルテーマ連動の動的背景・サイドバー描画。 |
