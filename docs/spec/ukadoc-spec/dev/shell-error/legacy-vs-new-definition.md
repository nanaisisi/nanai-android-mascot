# 旧定義/新定義がどうこう言われた

- **規格**: [shell-error.md](../../../../ukadoc-spec/dev/shell-error.md) ([公式版](https://ukatech.shillest.net/ukadoc-spec/dev/shell-error/))
- **検索語**: surfaces.txt
- **対応状況**: ⚠️ 一部対応

## 突合結果

surfaces.txt の旧定義・新定義双方の構文パースに対応。

## 実装箇所

- `crates/nanai-core/src/surfaces_parser/mod.rs:1` `//! `surfaces.txt` (UKADOC / SSP 仕様準拠) 高速パーサーモジュール`
- `src-tauri/src/commands/shell/mod.rs:3` `//! ukadoc-spec のシェル定義（descript.txt / surfaces.txt / surfacetable.txt）`
- `ui/ts/core/config.ts:21` `surfacesTxt: "surfaces.txt",`
- `crates/nanai-core/src/surfaces_parser/parser/core.rs:1` `//! `surfaces.txt` メイン構造化パース処理`
- `ui/ts/surface/surface-manager.ts:3` `* @brief SurfaceManager - surfaces.txt / ShellManifest 管理、着せ替え、合成、当たり判定統合マネージャー`
- `crates/nanai-core/src/surfaces_parser/parser/core.rs:12` `/// `surfaces.txt` のテキスト文字列を高速に構造化パース`
