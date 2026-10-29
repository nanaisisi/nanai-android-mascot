# descript 設定群 総合適合確認マスタインデックス (Descript Configs Top-Level Index)

- **言及規格の元ドキュメント・権利者・ライセンス**:
  - **ukadoc-spec/descript**: [ukatech/ukadoc-spec](https://ukatech.shillest.net/ukadoc-spec/) - © UKADOC project / Ukagaka Tech Team (CC BY 4.0)
- **管理・検証規定**: [厳密コード検証システム規定 (Strict Code Verification Protocol)](../../developer/strict-code-verification-system.md)

本ドキュメントは、伺かにおける各種設定ファイル (`descript.txt`, `install.txt`, `delete.txt`, `developer_options.txt`, `updates_def.txt`, `surfacetable.txt`) の全領域と、Nanai Android Mascot のソースコード実装およびテスト結果を 1 対 1 で統合管理するためのトップレベルマスタインデックスである。

---

## 1. ディレクトリ別適合マトリクス

| サブカテゴリ | 対象領域・ファイル規格 | 対応状況 | 統合インデックスドキュメント |
| :--- | :--- | :---: | :--- |
| **`ghost/`** | ゴースト設定 (`descript.txt` / 推奨バルーン) | ✅ 対応済 (100%) | **[ghost/index.md](ghost/index.md)** |
| **`balloon/`** | バルーン設定 (`descript.txt` / オプション / 推奨ゴースト) | ✅ 対応済 (100%) | **[balloon/index.md](balloon/index.md)** |
| **`shell/`** | シェル設定 (`descript.txt` / オーナードローメニュー) | ✅ 対応済 (100%) | **[shell/index.md](shell/index.md)** |
| **`plugin/`** | プラグイン設定 (`descript.txt`) | ✅ 対応済 (100%) | **[plugin/index.md](plugin/index.md)** |
| **`headline/`** | ヘッドライン設定 (`descript.txt`) | ✅ 対応済 (100%) | **[headline/index.md](headline/index.md)** |
| **`install/`** | インストール・更新設定 (`install.txt`, `delete.txt`, `updates_def.txt` 等) | ✅ 対応済 (100%) | **[install/index.md](install/index.md)** |
| **`shell-surfaces/`** | サーフィスブレース定義 (`surfaces.txt` 構文) | ✅ 対応済 (100%) | **[shell-surfaces/index.md](shell-surfaces/index.md)** |
| **`shell-surfacetable/`** | サーフェステーブル定義 (`surfacetable.txt`) | ✅ 対応済 (100%) | **[shell-surfacetable/index.md](shell-surfacetable/index.md)** |

---

## 2. 厳密コード検証アノテーションの遵守保証

[厳密コード検証システム規定](../../developer/strict-code-verification-system.md) に基づき、各インデックス配下に含まれる全仕様項目は、対応するソースコードファイル (`src-tauri/` / `ui/js/`) 内のコメントへ **`// [項目名,タイトル]: ...`** 形式で直接アノテーションされており、Vitest 単体テスト群にて全件検証が行われている。
