# (myghost)/shell/master/

- **規格**: [directory.md](../../../../ukadoc-spec/manual/directory.md) ([公式版](https://ukatech.shillest.net/ukadoc-spec/manual/directory/))
- **検索語**: scan_shells_from_ghost
- **対応状況**: ✅ 実装済

## 突合結果

`docs/ukadoc-spec/manual/directory.md` の `(myghost)/shell/` および必須のデフォルトシェルフォルダ `(myghost)/shell/master/` に対応し、`scan_shells_from_ghost` が `shell/` 配下を走査して `master` を先頭に優先ソートし、未存在時にも `master` のフォールバックエントリを生成する。サーフィス画像読込 `load_surface_image` でも対象シェルに画像が存在しない場合は `shell/master/` へフォールバックし、`crates/ui` の `Shell::load` 単体テストで `shell/master` の読込と VFS 大文字小文字吸収を検証している。

## 実装箇所

- `src-tauri/src/ghost/scan/shell/mod.rs:14` `pub fn scan_shells_from_ghost(ghost_dir: &Path) -> Vec<ShellInfo> {`
- `src-tauri/src/ghost/scan/shell/mod.rs:56` `shells.sort_by(|a, b| match (a.name.as_str(), b.name.as_str()) {`
- `src-tauri/src/ghost/scan/shell/mod.rs:63` `if shells.is_empty() {`
- `src-tauri/src/commands/file/surface_image.rs:34` `let master_dir = base_ghost_path.join("shell").join("master");`
- `crates/ui/src/shell/tests.rs:11` `fn test_load_mock_shell() {`
