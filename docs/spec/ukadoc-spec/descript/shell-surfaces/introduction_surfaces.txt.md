# surfaces.txt

- **規格**: [introduction_surfaces.txt.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell-surfaces/introduction_surfaces.txt/) (ukadoc-spec/descript/shell-surfaces/introduction_surfaces.txt.md)
- **検索語**: surfaces.txt
- **対応状況**: ✅ 実装済

## 突合結果

`ui/js/surface/surface-load.js` の `loadSurfacesTxt` において `surfaces.txt` ファイル・エイリアス・アニメーション・衝突判定・カーソル定義をパース・解決する実装が行われている。

## 実装箇所

- `crates/nanai-core/src/surfaces_parser.rs:1` `//! `surfaces.txt` (UKADOC / SSP 仕様準拠) 高速パーサーモジュール`
- `src-tauri/src/commands/shell/mod.rs:3` `//! ukadoc-spec のシェル定義（descript.txt / surfaces.txt / surfacetable.txt）`
- `ui/ts/core/config.ts:21` `surfacesTxt: "surfaces.txt",`
- `ui/ts/ui/spec-compliance-runner.ts:527` `"surfaces.txt ➔ surfaceCollisionMethods.resolveSurfaceNumber ➔ Scope-Isolated Su`
- `tests/parser-fuzzing/cycle10-syntax-fuzzing.test.ts:17` `test("Parser Fuzzing Cycle 10: surfaces.txt compound intervals, bracketed surfac`
- `crates/nanai-core/src/surfaces_parser.rs:63` `/// `surfaces.txt` のテキスト文字列を高速に構造化パース`
