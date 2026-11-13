# craftman,作者名

- **規格**: [craftman.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell/descript-txt/craftman/) (ukadoc-spec/descript/shell/descript-txt/craftman.md)
- **検索語**: craftman
- **対応状況**: ✅ 実装済

## 突合結果

ghost/scan.rs 等で descript の値を読込している。表示・動作への反映は個別未確認。

## 実装箇所

- `crates/nanai-core/src/descript_parser.rs:34` `pub fn craftman(&self) -> Option<&str> {`
- `src-tauri/src/fmo.rs:42` `pub craftman: String,`
- `ui/ts/core/actions/ghost-actions.ts:47` `${row("作者", ghost.craftman)}`
- `ui/ts/ui/modal-explorer.ts:43` `[ghost.name, ghost.craftman, ghost.path].some((value) =>`
- `tests/core-actions.test.ts:140` `craftman: "Author",`
- `crates/nanai-core/src/descript_parser.rs:35` `self.get("craftman").or_else(|| self.get("author"))`
