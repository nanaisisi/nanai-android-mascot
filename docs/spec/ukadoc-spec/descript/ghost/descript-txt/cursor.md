# cursor,ファイル名 / mousecursor,ファイル名

- **規格**: [cursor.md](https://ukatech.shillest.net/ukadoc-spec/descript/ghost/descript-txt/cursor/) (ukadoc-spec/descript/ghost/descript-txt/cursor.md)
- **検索語**: cursor, mousecursor
- **対応状況**: ✅ 実装済

## 突合結果

`src-tauri/src/ghost/scan/directory.rs` および `ui/js/core/actions/balloon-descript/assets.js` の `setMouseCursor()` において `cursor` を検出し、`--balloon-cursor-default` カスタムプロパティへ反映する実装が行われている。

## 実装箇所

- `crates/nanai-surface/src/parser/helpers/blocks.rs:42` `"sakura.cursor",`
- `src-tauri/src/commands/install/utils.rs:154` `let mut cursor = std::io::Cursor::new(content);`
- `ui/ts/core/actions/balloon-descript/assets.ts:216` `setMouseCursor("cursor", "--balloon-cursor-default");`
- `ui/test-menu.html:30` `cursor: pointer;`
- `tests/balloon-cycle10-typography.test.ts:94` `describe("Anchor and cursor style decoration derivation (font/group.ts)", () => `
- `crates/nanai-surface/src/parser/helpers/blocks.rs:43` `"kero.cursor",`
