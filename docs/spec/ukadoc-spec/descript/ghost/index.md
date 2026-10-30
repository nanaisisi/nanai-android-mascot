# Ghost 設定 総合適合確認インデックス (Ghost Configs Master Index)

- **言及規格の元ドキュメント・権利者・ライセンス**:
  - **ukadoc-spec/descript/ghost**: [ukatech/ukadoc-spec](https://ukatech.shillest.net/ukadoc-spec/) - © UKADOC project / Ukagaka Tech Team (CC BY 4.0)
- **管理・検証規定**: [厳密コード検証システム規定 (Strict Code Verification Protocol)](../../developer/strict-code-verification-system.md)

本ドキュメントは、ゴースト設定（`descript.txt` / 推奨バルーン定義）に関するすべての規格仕様項目と、Nanai Android Mascot のソースコード実装（Rust バックエンド / JS フロントエンド）および Vitest 単体テスト結果を 1 対 1 で整合・管理するためのマスタインデックスである。

---

## 1. サブカテゴリ一覧・対応状況

| カテゴリ / 規格ファイル                                                    | 概要・対象領域                                                  |     対応状況     | 関連実装コード                                                                  |
| :------------------------------------------------------------------------- | :-------------------------------------------------------------- | :--------------: | :------------------------------------------------------------------------------ |
| **[descript.txt 仕様項目一覧](descript-txt/index.md)**                     | ゴースト名、作者、SHIORI、表示名、スコープ定義等 (全 72 項目)   | ✅ 対応済 (100%) | `src-tauri/src/ghost/scan/directory.rs`, `src-tauri/src/ghost/scan/descript.rs` |
| **[推奨バルーン定義 (recommended-balloon)](recommended-balloon/index.md)** | ゴースト推奨のバルーン設定 (`recommended.balloon` 等 全 5 項目) | ✅ 対応済 (100%) | `src-tauri/src/ghost/scan/directory.rs`, `ui/js/ghost/ghost.js`                 |

---

## 2. 実装およびコメントアノテーション保証

[厳密コード検証システム規定](../../developer/strict-code-verification-system.md) に基づき、上記の全サブカテゴリに含まれる全仕様項目は、該当ソースコードファイル内のコメントとして **`// [項目名,タイトル]: ...`** 形式で 1 回以上直接アノテーションされており、単体テスト (`tests/ghost.test.js`, `tests/ghost-loading.test.js`) にて 100% 正常動作が確認・担保されている。
