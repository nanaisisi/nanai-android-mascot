# cursorブレス記述例

- **規格**: [introduction_cursorbrace.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell-surfaces/cursor-brace/introduction_cursorbrace/) (ukadoc-spec/descript/shell-surfaces/cursor-brace/introduction_cursorbrace.md)
- **検索語**: cursor
- **対応状況**: ✅ 実装済

## 突合結果

ui/js/surface/surface-load.js の loadSurfacesTxt において surfaces.txt ファイル・エイリアス・アニメーション・衝突判定定義をパース・解決する実装が行われている。

## 実装箇所

- `crates/nanai-surface/src/parser/helpers/blocks.rs:42` `"sakura.cursor",`
- `src-tauri/src/commands/install/utils.rs:154` `let mut cursor = std::io::Cursor::new(content);`
- `ui/ts/core/actions/balloon-descript/assets.ts:216` `setMouseCursor("cursor", "--balloon-cursor-default");`
- `ui/test-menu.html:30` `cursor: pointer;`
- `tests/balloon-cycle10-typography.test.ts:94` `describe("Anchor and cursor style decoration derivation (font/group.ts)", () => `
- `crates/nanai-surface/src/parser/helpers/blocks.rs:43` `"kero.cursor",`
