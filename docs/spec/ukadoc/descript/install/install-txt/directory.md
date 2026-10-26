# directory,ディレクトリ名

- **規格**: [directory.md](https://ukatech.shillest.net/ukadoc-spec/descript/install/install-txt/directory/) (ukadoc-spec/descript/install/install-txt/directory.md)
- **検索語**: directory
- **対応状況**: 🔎 コード上に出現(処理の有無は要読解)

## 突合結果

実装コードに「directory」が出現。実際の処理内容は未精査。

## 実装箇所

- `src-tauri/src/commands/shiori/status.rs:2`  `use crate::ghost::scan::{ScanResult, scan_ghost_directory};`
- `src-tauri/src/commands/shiori/status.rs:33` (コメント) `// ghost_pathをghost_dirとしてscan_ghost_directoryに渡す`
- `src-tauri/src/commands/shiori/status.rs:34`  `scan_ghost_directory(state, ghost_path, app_handle).await`
- `ui/js/ui/templates/ghost-templates.js:27`  `<input type="text" id="ghost-directory" value="assets/ghost" />`
- `ui/js/ui/templates/ghost-templates.js:48`  `<input type="text" id="balloon-directory" value="assets/balloon" />`
