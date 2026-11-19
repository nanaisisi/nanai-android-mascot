# `surfaces.txt`

- **規格**: [shell.md](../../../../ukadoc-spec/manual/shell.md) ([公式版](https://ukatech.shillest.net/ukadoc-spec/manual/shell/))
- **検索語**: parse_surfaces_txt
- **対応状況**: ✅ 実装済

## 突合結果

`nanai_surface::parse_surfaces_txt`・`nanai_core::parse_surfaces_txt`（WASM 連携）・`Shell::load`・`SurfaceManager::loadSurfacesTxt` / `parseSurfacesTxt` により、サーフェス ID 割り当て、`element` レイヤー合成、SERIKO アニメーション、当たり判定（`collision` / `collisionex`）、エイリアス、カーソル、ツールチップのパースと適用を実装およびテスト済み。

## 実装箇所

- `crates/nanai-surface/src/parser/main_parser.rs:10` `pub fn parse_surfaces_txt(text: &str) -> SurfacesTxt {`
- `crates/nanai-core/src/surfaces_parser/parser/core.rs:13` `pub fn parse_surfaces_txt(text: &str) -> ParsedSurfacesManifest {`
- `crates/ui/src/shell/core.rs:48` `let surfaces_path = resolve_vfs_path(directory, "surfaces.txt")`
- `ui/ts/surface/surface-manager.ts:780` `async loadSurfacesTxt(`
- `ui/ts/surface/surface-manager.ts:865` `async parseSurfacesTxt(text: string): Promise<void> {`
- `crates/ui/src/shell/tests.rs:21` `let def0 = shell.surface(0).unwrap();`
- `tests/surface-collision-detection.test.ts:349` `it("parseSurfacesTxt parses surfaces via WASM and TS fallback, and expandSurfaceRange handles exclusions", async () => {`
