# path

- **規格**: [path.md](https://ukatech.shillest.net/ukadoc-spec/list/propertysystem/property-system/general-property/path/)
- **検索語**: path
- **対応状況**: ❌ 未実装(誤検出)

## 突合結果

ヒットしたのは一般的な語「path」の無関係な出現。該当の仕様に対応する処理は確認できない。

## 実装箇所

- `src-tauri/src/commands/shiori/status.rs:30`  `ghost_path: String,`
- `src-tauri/src/commands/shiori/status.rs:33` (コメント) `// ghost_pathをghost_dirとしてscan_ghost_directoryに渡す`
- `src-tauri/src/commands/shiori/status.rs:34`  `scan_ghost_directory(state, ghost_path, app_handle).await`
- `ui/js/core/app-update.js:27`  `const ghostPath = gc.currentGhost?.path || "";`
- `ui/js/core/app-update.js:65`  `const fileListStr = checkResult.update_files.map((f) => f.path).join(",");`
