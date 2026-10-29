# Shell Surfaces 設定 総合適合確認インデックス (Shell Surfaces Configs Master Index)

- **言及規格の元ドキュメント・権利者・ライセンス**:
  - **ukadoc-spec/descript/shell-surfaces**: [ukatech/ukadoc-spec](https://ukatech.shillest.net/ukadoc-spec/) - © UKADOC project / Ukagaka Tech Team (CC BY 4.0)
- **管理・検証規定**: [厳密コード検証システム規定 (Strict Code Verification Protocol)](../../../developer/strict-code-verification-system.md)

本ドキュメントは、サーフィス設定（`descript.txt` 内ブレース構文 / アニメーション定義）に関するすべての規格仕様項目と、Nanai Android Mascot のソースコード実装（`shell.rs` / `surface-load.js` / `surfaces.txt` パーサー）を 1 対 1 で整合・管理するためのマスタインデックスである。

---

## 1. サブカテゴリ一覧・対応状況

| カテゴリ / 規格ファイル | 概要・対象領域 | 対応状況 | 関連実装コード |
| :--- | :--- | :---: | :--- |
| **[descript-brace 仕様項目一覧](descript-brace/index.md)** | `version`, `maxsurface` 等サーフィス全般定義 | ✅ 対応済 (100%) | `src-tauri/src/ghost/scan/shell.rs`, `ui/js/surface/surface-load.js` |
| **[surface-alias-brace 仕様項目一覧](surface-alias-brace/index.md)** | サーフィスエイリアス定義 (`surface.alias`) | ✅ 対応済 (100%) | `ui/js/surface/surface-load.js` |
| **[surface-brace 仕様項目一覧](surface-brace/index.md)** | アニメーションインターバル・描画メソッド定義 | ✅ 対応済 (100%) | `ui/js/surface/surface-load.js` |
| **[tooltip-brace 仕様項目一覧](tooltip-brace/index.md)** | サーフィスツールチップ定義 | ✅ 対応済 (100%) | `ui/js/surface/surface-load.js` |
