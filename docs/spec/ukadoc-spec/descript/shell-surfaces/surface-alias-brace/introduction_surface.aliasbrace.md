# surface.aliasブレス記述例

- **規格**: [introduction_surface.aliasbrace.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell-surfaces/surface-alias-brace/introduction_surface.aliasbrace/) (ukadoc-spec/descript/shell-surfaces/surface-alias-brace/introduction_surface.aliasbrace.md)
- **検索語**: surface.alias
- **対応状況**: ✅ 対応済 (surface-load.js)

## 突合結果

`ui/js/surface/surface-load.js` において、`surfaces.txt` 内の `surface.alias` ブレース定義をパースし適用する実装が行われている。

## 実装箇所

- `crates/ui/src/manifest.rs:39` `/// `surface.alias` / `sakura.surface.alias` ブロックの エイリアス名 → サーフィス番号列`
- `crates/ui/src/manifest.rs:41` `/// `kero.surface.alias` / `char1.surface.alias` ブロックの エイリアス名 → 番号列`
- `crates/ui/src/shell.rs:66` `/// `surface.alias` ブロック（エイリアス名）からサーフィス定義を解決する`
- `crates/ui/src/surfaces/parser/mod.rs:15` `/// `surface.alias {}` / `sakura.surface.alias {}` / `kero.surface.alias {}` ブロッ`
- `crates/ui/src/surfaces/parser/mod.rs:76` `/// ブロック開始行（`surface[N]` / `surface.append[N]` / `*.surface.alias` / `descript`）`
