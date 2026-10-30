# Plugin 設定 総合適合確認インデックス (Plugin Configs Master Index)

- **言及規格の元ドキュメント・権利者・ライセンス**:
  - **ukadoc-spec/descript/plugin**: [ukatech/ukadoc-spec](https://ukatech.shillest.net/ukadoc-spec/) - © UKADOC project / Ukagaka Tech Team (CC BY 4.0)
- **管理・検証規定**: [厳密コード検証システム規定 (Strict Code Verification Protocol)](../../../developer/strict-code-verification-system.md)

本ドキュメントは、プラグイン設定（`descript.txt`）に関するすべての規格仕様項目と、Nanai Android Mascot のソースコード実装を 1 対 1 で整合・管理するためのマスタインデックスである。

---

## 1. サブカテゴリ一覧・対応状況

| カテゴリ / 規格ファイル                                | 概要・対象領域                                                        |     対応状況     | 関連実装コード                                                    |
| :----------------------------------------------------- | :-------------------------------------------------------------------- | :--------------: | :---------------------------------------------------------------- |
| **[descript.txt 仕様項目一覧](descript-txt/index.md)** | プラグイン名、ID、実行可能ファイル、イベントタイマー設定 (全 12 項目) | ✅ 対応済 (100%) | `src-tauri/src/commands/ext.rs`, `src-tauri/src/common/models.rs` |
