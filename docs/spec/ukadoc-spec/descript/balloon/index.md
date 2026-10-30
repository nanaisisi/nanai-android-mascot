# Balloon 設定 総合適合確認インデックス (Balloon Configs Master Index)

- **言及規格の元ドキュメント・権利者・ライセンス**:
  - **ukadoc-spec/descript/balloon**: [ukatech/ukadoc-spec](https://ukatech.shillest.net/ukadoc-spec/) - © UKADOC project / Ukagaka Tech Team (CC BY 4.0)
- **管理・検証規定**: [厳密コード検証システム規定 (Strict Code Verification Protocol)](../../../developer/strict-code-verification-system.md)

本ドキュメントは、バルーン設定（`descript.txt` / オプションファイル / 推奨ゴースト定義）に関するすべての規格仕様項目と、Nanai Android Mascot のソースコード実装（Rust バックエンド / JS フロントエンド）および Vitest 単体テスト結果を 1 対 1 で整合・管理するためのマスタインデックスである。

---

## 1. サブカテゴリ一覧・対応状況

| カテゴリ / 規格ファイル                                                | 概要・対象領域                                                                                     |     対応状況     | 関連実装コード                                                                                                          |
| :--------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------- | :--------------: | :---------------------------------------------------------------------------------------------------------------------- |
| **[descript.txt 仕様項目一覧](descript-txt/index.md)**                 | フォント、アンカー、カーソル、有効領域、アセット、表示位置、縦書き等のプロパティ定義 (全 163 項目) | ✅ 対応済 (100%) | `src-tauri/src/commands/shell/balloon.rs`, `ui/js/core/actions/balloon-descript/` (`font.js`, `layout.js`, `assets.js`) |
| **[個別オプション指定 (balloons*s.txt 等)](balloonsoption/index.md)**  | スコープ別吹出し・矢印・マーカー各種アセットファイル指定 (全 6 項目)                               | ✅ 対応済 (100%) | `ui/js/ghost/balloon-window.js`, `ui/js/core/actions/balloon-descript/assets.js`                                        |
| **[推奨ゴースト定義 (recommended-ghost)](recommended-ghost/index.md)** | バルーン固有の推奨・指定ゴースト設定 (`recommended.ghost` 等 全 3 項目)                            | ✅ 対応済 (100%) | `src-tauri/src/commands/shell/balloon.rs`, `ui/js/core/actions/balloon-descript/assets.js`                              |

---

## 2. 実装およびコメントアノテーション保証

[厳密コード検証システム規定](../../../developer/strict-code-verification-system.md) に基づき、上記の全サブカテゴリに含まれる全仕様項目は、該当ソースコードファイル内のコメントとして **`// [項目名,タイトル]: ...`** 形式で 1 回以上直接アノテーションされており、単体テスト (`tests/balloon-descript.test.js`, `tests/balloon-window.test.js`) にて 100% 正常動作が確認・担保されている。
