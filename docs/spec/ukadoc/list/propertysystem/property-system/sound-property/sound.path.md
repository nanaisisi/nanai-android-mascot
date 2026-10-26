# path

- **規格**: [sound.path.md](https://ukatech.shillest.net/ukadoc-spec/list/propertysystem/property-system/sound-property/sound.path/)
- **検索語**: path
- **対応状況**: 🔎 コード上に出現(処理の有無は要読解)

## 突合結果

実装コードに「path」が出現。実際の処理内容は未精査。

## 実装箇所

- `src-tauri/src/commands/shiori/status.rs:30`  `ghost_path: String,`
- `src-tauri/src/commands/shiori/status.rs:33` (コメント) `// ghost_pathをghost_dirとしてscan_ghost_directoryに渡す`
- `src-tauri/src/commands/shiori/status.rs:34`  `scan_ghost_directory(state, ghost_path, app_handle).await`
- `ui/js/core/app-update.js:27`  `const ghostPath = gc.currentGhost?.path || "";`
- `ui/js/core/app-update.js:65`  `const fileListStr = checkResult.update_files.map((f) => f.path).join(",");`
