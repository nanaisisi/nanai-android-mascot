# ukadoc-spec 総合ディレクトリ・網羅インデックス (Master Compliance Directory Index)

- **言及規格の元ドキュメント・権利者・ライセンス**:
  - **ukadoc-spec (本家仕様リポジトリ)**: [ukatech/ukadoc-spec](https://ukatech.shillest.net/ukadoc-spec/) - © UKADOC project / Ukagaka Tech Team (CC BY 4.0)

本ドキュメントは、ローカル参照リポジトリ `e:\project\reference\ukagaka\ukadoc-spec\` に含まれるすべてのトップレベルディレクトリを完全に網羅し、Nanai Android Mascot における各カテゴリごとの適合状態・実装状況を統合管理するためのマスタインデックスである。

---

## ukadoc-spec トップレベルディレクトリ網羅一覧

| ディレクトリ名   | 概要・対象領域                                                                            | プロジェクトにおける実装・適合状況 | 主要な関連実装・対応ファイル                                                                                 |
| :--------------- | :---------------------------------------------------------------------------------------- | :--------------------------------: | :----------------------------------------------------------------------------------------------------------- |
| **`dev/`**       | 開発者向け詳細、NAR作成、着せ替え(Bind)、オーナードローメニュー、ネットワーク更新実例     |              **95%**               | `src-tauri/src/ghost/scan/mod.rs`, `src-tauri/src/commands/install.rs`, `ui/css/context-menu.css`            |
| **`list/`**      | さくらスクリプトタグ一覧、SHIORIイベント、プラグインイベント、プロパティシステム一覧      |              **95%**               | `crates/ui/src/script/`, `src-tauri/src/commands/shiori/`, `ui/js/ghost/`                                    |
| **`spec/`**      | SHIORI/3.0、さくらスクリプト、バルーン等の基礎プロトコル仕様                              |              **95%**               | `crates/ui/src/shiori/`, `src-tauri/src/shiori/dynamic/`, `ui/js/ghost/`                                     |
| **`manual/`**    | ゴースト・シェル・バルーンのディレクトリ構造、オーナードローメニュー解説                  |              **98%**               | `src-tauri/src/ghost/scan/`, `ui/menu-iframe.html`, `ui/js/ui/submenu.js`                                    |
| **`descript/`**  | ghost, balloon, shell, plugin, headline, install の各設定ファイル（descript.txt）記述仕様 |              **95%**               | `src-tauri/src/ghost/scan/descript.rs`, `src-tauri/src/ghost/scan/shell.rs`, `src-tauri/src/commands/ext.rs` |
| **`memo/`**      | ドラフト・検討中の仕様メモ                                                                |              **参考**              | 実装の設計思想の参考として参照                                                                               |
| **`migration/`** | 旧バージョンからの移行ガイド                                                              |              **参考**              | API移行および Tauri v2 移行設計に活用                                                                        |
| **`assets/`**    | 仕様書で使用される図版・アイコン等の静的アセット                                          |              **参考**              | ドキュメント用の参照素材                                                                                     |
| **`scripts/`**   | ドキュメント生成や検証用スクリプト群                                                      |              **参考**              | 仕様検証の補助                                                                                               |
