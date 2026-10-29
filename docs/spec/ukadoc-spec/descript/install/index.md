# Install / Updates 設定 総合適合確認インデックス (Install Configs Master Index)

- **言及規格の元ドキュメント・権利者・ライセンス**:
  - **ukadoc-spec/descript/install**: [ukatech/ukadoc-spec](https://ukatech.shillest.net/ukadoc-spec/) - © UKADOC project / Ukagaka Tech Team (CC BY 4.0)
- **管理・検証規定**: [厳密コード検証システム規定 (Strict Code Verification Protocol)](../../../developer/strict-code-verification-system.md)

本ドキュメントは、インストールおよび更新設定（`install.txt`, `delete.txt`, `developer_options.txt`, `updates_def.txt`, `.narignore` 等）に関するすべての規格仕様項目と、Nanai Android Mascot のソースコード実装を 1 対 1 で整合・管理するためのマスタインデックスである。

---

## 1. サブカテゴリ一覧・対応状況

| カテゴリ / 規格ファイル | 概要・対象領域 | 対応状況 | 関連実装コード |
| :--- | :--- | :---: | :--- |
| **[install.txt 仕様項目一覧](install-txt/index.md)** | アーカイブ展開時ターゲット振り分け (`name`, `type`, `directory`) | ✅ 対応済 (100%) | `src-tauri/src/commands/install/archive.rs` |
| **[delete.txt 仕様項目一覧](delete.txt/index.md)** | アンインストール時自動削除定義 | ✅ 対応済 (100%) | `src-tauri/src/commands/install/archive.rs` |
| **[developer_options.txt 仕様項目一覧](developer_options.txt/index.md)** | 開発者向けオプションフラグ制御 | ✅ 対応済 (100%) | `src-tauri/src/ghost/scan/directory.rs` |
| **[.narignore / .updateignore / .narinclude / .updateinclude](narignore-updateignore-narinclude-updateinclude.md)** | アーカイブ・更新用除外・追加定義 | ✅ 対応済 (100%) | `src-tauri/src/ghost/scan/directory.rs` |
| **[updates_def.txt 仕様項目一覧](updates_def-txt/index.md)** | ネットワーク更新制御定義 | ✅ 対応済 (100%) | `src-tauri/src/commands/update/dau.rs` |
