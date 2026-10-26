# replace

- **規格**: [replace.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell-surfaces/surface-brace/h-drowmethod/replace/) (ukadoc-spec/descript/shell-surfaces/surface-brace/h-drowmethod/replace.md)
- **検索語**: replace
- **対応状況**: 🔎 コード上に出現(処理の有無は要読解)

## 突合結果

実装コードに「replace」が出現。実際の処理内容は未精査。

## 実装箇所

- `ui/js/surface/surface-compositor.js:166`  `if (elem.type === "replace") {`
- `src-tauri/src/common.rs:152`  `s.replace('/', std::path::MAIN_SEPARATOR_STR)`
- `src-tauri/src/commands/install.rs:27`  `let name = decoded_name.replace('\\', "/");`
- `src-tauri/src/commands/install.rs:106`  `let entry_name = decoded_name.replace('\\', "/");`
- `ui/js/core/tauri-helper.js:53`  `const normalized = filePath.replace(/\\/g, "/");`
