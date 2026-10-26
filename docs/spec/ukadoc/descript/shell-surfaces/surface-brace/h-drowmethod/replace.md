# replace

- **規格**: [replace.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell-surfaces/surface-brace/h-drowmethod/replace/) (ukadoc-spec/descript/shell-surfaces/surface-brace/h-drowmethod/replace.md)
- **検索語**: replace
- **対応状況**: ❓ 要確認(surface 関連語)

## 突合結果

サーフェス処理 (ui/js/surface/) に関連する語「replace」が出現。surfaces.txt の該当機能として実装されているかは個別の読解が必要。

## 実装箇所

- `ui/js/surface/surface-compositor.js:166`  `if (elem.type === "replace") {`
- `src-tauri/src/common.rs:152`  `s.replace('/', std::path::MAIN_SEPARATOR_STR)`
- `src-tauri/src/commands/install.rs:27`  `let name = decoded_name.replace('\\', "/");`
- `src-tauri/src/commands/install.rs:106`  `let entry_name = decoded_name.replace('\\', "/");`
- `ui/js/core/tauri-helper.js:53`  `const normalized = filePath.replace(/\\/g, "/");`
