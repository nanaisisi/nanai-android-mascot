# Shell 設定 総合適合確認インデックス (Shell Configs Master Index)

- **言及規格の元ドキュメント・権利者・ライセンス**:
  - **ukadoc-spec/descript/shell**: [ukatech/ukadoc-spec](https://ukatech.shillest.net/ukadoc-spec/) - © UKADOC project / Ukagaka Tech Team (CC BY 4.0)
- **管理・検証規定**: [厳密コード検証システム規定 (Strict Code Verification Protocol)](../../../developer/strict-code-verification-system.md)

本ドキュメントは、シェル設定（`descript.txt` / オーナードローメニュー・着せ替え等）に関するすべての規格仕様項目と、Nanai Android Mascot のソースコード実装（Rust バックエンド `src-tauri/src/ghost/scan/shell.rs` / JS フロントエンド `ui/js/ui/submenu.js`）を 1 対 1 で整合・管理するためのマスタインデックスである。

---

## 1. サブカテゴリ一覧・対応状況

| カテゴリ / 規格ファイル                                | 概要・対象領域                                                                   |     対応状況     | 関連実装コード                                             |
| :----------------------------------------------------- | :------------------------------------------------------------------------------- | :--------------: | :--------------------------------------------------------- |
| **[descript.txt 仕様項目一覧](descript-txt/index.md)** | シェル名、オーナードローメニュー背景・フォント、バインド着せ替え等 (全 101 項目) | ✅ 対応済 (100%) | `src-tauri/src/ghost/scan/shell.rs`, `ui/js/ui/submenu.js` |

---

## 2. 実装およびコメントアノテーション保証

[厳密コード検証システム規定](../../../developer/strict-code-verification-system.md) に基づき、上記の全仕様項目は該当ソースコードファイル内のコメントとして **`// [項目名,タイトル]: ...`** 形式で直接アノテーションされている。
