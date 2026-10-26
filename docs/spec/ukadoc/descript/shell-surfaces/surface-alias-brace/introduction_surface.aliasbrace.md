# surface.aliasブレス記述例

- **規格**: [introduction_surface.aliasbrace.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell-surfaces/surface-alias-brace/introduction_surface.aliasbrace/) (ukadoc-spec/descript/shell-surfaces/surface-alias-brace/introduction_surface.aliasbrace.md)
- **検索語**: surface.alias
- **対応状況**: ✅ 実装済 (パーサー + 描画への反映)

## 突合結果

`surface.alias` / `sakura.surface.alias` / `kero.surface.alias`（SSP拡張 `char0.surface.alias` / `char1.surface.alias` 含む）を
Rust パーサーが解析し、マニフェスト経由で JS のサーフィス表示 (`updateSurface`) から参照できる。
複数番号指定（例: `照れ,[1,101,201]`）はランダム抽選で番号を決定 (SSP 挙動準拠)。

## 実装箇所

- `crates/ui/src/surfaces.rs`  `handle_alias_line` / `parse_block_opener` (エイリアス名 → 番号列、キャラクタープレフィックス対応)、`alias_numbers` / `kero_alias_numbers` / `resolve_alias` / `resolve_kero_alias`
- `crates/ui/src/manifest.rs`  `ShellManifest.aliases` / `ShellManifest.kero_aliases` (JSON 化)
- `ui/js/surface/shell-manifest.js`  `manifestToSurfaceData` (aliases / keroAliases の伝播)
- `ui/js/surface/surface.js`  `resolveSurfaceNumber(surfaceId, scopeId)` (別名 → 番号ランダム抽選)、`activeBindLayers` (bind pattern surface 名の解決)
- `ui/js/surface/ghost-surface.js`  `updateSurface` 入口で全サーフィス参照を解決
