# directory,ディレクトリ名

- **規格**: [directory.md](https://ukatech.shillest.net/ukadoc-spec/descript/install/install-txt/directory/) (ukadoc-spec/descript/install/install-txt/directory.md)
- **検索語**: directory
- **対応状況**: ❌ 未実装(誤検出)

## 突合結果

ヒットしたのは一般的な語「directory」の無関係な出現。該当の仕様に対応する処理は確認できない。

## 実装箇所

- `src-tauri/src/commands/shiori/status.rs:2`  `use crate::ghost::scan::{ScanResult, scan_ghost_directory};`
- `src-tauri/src/commands/shiori/status.rs:33` (コメント) `// ghost_pathをghost_dirとしてscan_ghost_directoryに渡す`
- `src-tauri/src/commands/shiori/status.rs:34`  `scan_ghost_directory(state, ghost_path, app_handle).await`
- `ui/js/ui/templates/ghost-templates.js:27`  `<input type="text" id="ghost-directory" value="assets/ghost" />`
- `ui/js/ui/templates/ghost-templates.js:48`  `<input type="text" id="balloon-directory" value="assets/balloon" />`
