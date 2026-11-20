# surfaces.txt

- **規格**: [introduction_surfaces.txt.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell-surfaces/introduction_surfaces.txt/) (ukadoc-spec/descript/shell-surfaces/introduction_surfaces.txt.md)
- **検索語**: surfaces.txt
- **対応状況**: ⚠️ 一部対応

## 突合結果

`ui/js/surface/surface-load.js` の `loadSurfacesTxt` において `surfaces.txt` ファイル・エイリアス・アニメーション・衝突判定・カーソル定義をパース・解決する実装が行われている。

## 実装箇所

- `crates/nanai-core/src/surfaces_parser/mod.rs:1` `//! `surfaces.txt` (UKADOC / SSP 仕様準拠) 高速パーサーモジュール`
- `src-tauri/src/commands/shell/mod.rs:3` `//! ukadoc-spec のシェル定義（descript.txt / surfaces.txt / surfacetable.txt）`
- `ui/ts/core/config.ts:21` `surfacesTxt: "surfaces.txt",`
- `crates/nanai-core/src/surfaces_parser/parser/core.rs:1` `//! `surfaces.txt` メイン構造化パース処理`
- `ui/ts/surface/surface-manager.ts:3` `* @brief SurfaceManager - surfaces.txt / ShellManifest 管理、着せ替え、合成、当たり判定統合マネージャー`
- `crates/nanai-core/src/surfaces_parser/parser/core.rs:12` `/// `surfaces.txt` のテキスト文字列を高速に構造化パース`
