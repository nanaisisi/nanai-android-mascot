# Shell Surfaces 設定 総合適合確認インデックス (Shell Surfaces Configs Master Index)

- **言及規格の元ドキュメント・権利者・ライセンス**:
  - **ukadoc-spec/descript/shell-surfaces**: [ukatech/ukadoc-spec](https://ukatech.shillest.net/ukadoc-spec/) - © UKADOC project / Ukagaka Tech Team (CC BY 4.0)
- **管理・検証規定**: [厳密コード検証システム規定 (Strict Code Verification Protocol)](../../../../doc/developer/strict-code-verification-system.md)

本ドキュメントは、サーフィス設定（`descript.txt` 内ブレース構文 / アニメーション定義）に関するすべての規格仕様項目と、Nanai Android Mascot のソースコード実装（`src-tauri/src/ghost/scan/shell/mod.rs` / `ui/ts/surface/surface-load.ts` / `crates/nanai-core/src/surfaces_parser.rs`）を 1 対 1 で整合・管理するためのマスタインデックスである。

---

## 1. サブカテゴリ一覧・対応状況

| カテゴリ / 規格ファイル                                              | 概要・対象領域                                |     対応状況     | 関連実装コード                                                           |
| :------------------------------------------------------------------- | :-------------------------------------------- | :--------------: | :----------------------------------------------------------------------- |
| **[surfaces.txt 概要](introduction_surfaces.txt.md)**                | `surfaces.txt` 全般概要・定義仕様             |    ✅ 実装済     | `crates/nanai-core/src/surfaces_parser.rs`, `ui/ts/surface/surface-load.ts` |
| **[surfaces.txt または surfaces\*\*.txt(SSPのみ)](file/index.md)**   | `surfaces.txt` ファイル・エンコーディング仕様 | ✅ 対応済 (100%) | `ui/ts/surface/surface-load.ts`                                          |
| **[descriptブレス](descript-brace/index.md)**                        | `version`, `maxsurface` 等サーフィス全般定義  | ✅ 対応済 (100%) | `src-tauri/src/ghost/scan/shell/mod.rs`, `ui/ts/surface/surface-load.ts` |
| **[surface-alias-brace 仕様項目一覧](surface-alias-brace/index.md)** | サーフィスエイリアス定義 (`surface.alias`)    | ✅ 対応済 (100%) | `ui/ts/surface/surface-load.ts`                                          |
| **[surface-brace 仕様項目一覧](surface-brace/index.md)**             | アニメーションインターバル・描画メソッド定義  | ✅ 対応済 (100%) | `ui/ts/surface/surface-load.ts`                                          |
| **[cursorブレス](cursor-brace/index.md)**                            | カーソルイベントブレース定義                  | ✅ 対応済 (100%) | `ui/ts/surface/surface-load.ts`                                          |
| **[tooltip-brace 仕様項目一覧](tooltip-brace/index.md)**             | サーフィスツールチップ定義                    | ✅ 対応済 (100%) | `ui/ts/surface/surface-load.ts`                                          |
