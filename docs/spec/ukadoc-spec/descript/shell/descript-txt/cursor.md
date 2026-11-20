# cursor,ファイル名 / mousecursor,ファイル名

- **規格**: [cursor.md](../../../../../ukadoc-spec/descript/shell/descript-txt/cursor.md)
- **検索語**: cursor
- **対応状況**: ✅ 実装済

## 突合結果

未確認・未実装。


## 実装箇所

- `crates/nanai-surface/src/parser/helpers/blocks.rs:42` `"sakura.cursor",`
- `src-tauri/src/commands/file/helpers.rs:52` `let mut cursor = std::io::Cursor::new(&mut png_bytes);`
- `ui/ts/core/actions/balloon-descript/assets.ts:399` `setMouseCursor("cursor", "--balloon-cursor-default");`
- `ui/test-menu.html:30` `cursor: pointer;`
- `tests/balloon-cycle10-typography.test.ts:88` `describe("Anchor and cursor style decoration derivation (font/group.ts)", () => `
- `crates/nanai-surface/src/parser/helpers/blocks.rs:43` `"kero.cursor",`
