# surface.aliasブレス記述例

- **規格**: [introduction_surface.aliasbrace.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell-surfaces/surface-alias-brace/introduction_surface.aliasbrace/) (ukadoc-spec/descript/shell-surfaces/surface-alias-brace/introduction_surface.aliasbrace.md)
- **検索語**: surface.alias
- **対応状況**: ✅ 実装済 (パーサー + 描画への反映)

## 突合結果

`surface.alias` / `sakura.surface.alias` / `kero.surface.alias`（SSP拡張 `char0.surface.alias` / `char1.surface.alias` 含む）を
Rust パーサーが解析し、マニフェスト経由で JS のサーフィス表示 (`updateSurface`) から参照できる。
複数番号指定（例: `照れ,[1,101,201]`）はランダム抽選で番号を決定 (SSP 挙動準拠)。

## 実装箇所

- `crates/ui/src/shell.rs:67` `/// `surface.alias` ブロック（エイリアス名）からサーフィス定義を解決する`
- `crates/ui/src/manifest.rs:39` `/// `surface.alias` / `sakura.surface.alias` ブロックの エイリアス名 → サーフィス番号列`
- `crates/ui/src/manifest.rs:41` `/// `kero.surface.alias` / `char1.surface.alias` ブロックの エイリアス名 → 番号列`
- `crates/ui/src/surfaces/tests.rs:254` `surface.alias`
- `crates/ui/src/surfaces/tests.rs:291` `sakura.surface.alias`
