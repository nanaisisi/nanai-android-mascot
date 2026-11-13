# replace

- **規格**: [replace.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell-surfaces/surface-brace/h-animationinterval/replace/) (ukadoc-spec/descript/shell-surfaces/surface-brace/h-animationinterval/replace.md)
- **検索語**: replace
- **対応状況**: ✅ 実装済


## 実装箇所

- `crates/nanai-core/src/balloon_descript.rs:47` `let norm_expected = expected_path.replace('\\', "/").to_ascii_lowercase();`
- `src-tauri/src/lib.rs:58` `.replace("error: e  as any", "error: e as E")`
- `ui/ts/core/tauri-helper.ts:124` `const normalized = filePath.replace(/\\/g, "/");`
- `ui/ts/ui/context-menu.ts:65` `.replace("-menu-btn", "")`
- `tests/modal-explorer.test.ts:42` `querySelector: (sel) => getEl(sel.replace("#", "")),`
- `crates/nanai-core/src/balloon_descript.rs:48` `let norm_current = current_ghost_path.replace('\\', "/").to_ascii_lowercase();`
