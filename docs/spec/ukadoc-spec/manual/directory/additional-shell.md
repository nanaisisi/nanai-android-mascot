# (myghost)/shell/(additional_shell)/

- **規格**: [directory.md](../../../../ukadoc-spec/manual/directory.md) ([公式版](https://ukatech.shillest.net/ukadoc-spec/manual/directory/))
- **検索語**: resolve_shell_dir
- **対応状況**: ✅ 実装済

## 突合結果

`docs/ukadoc-spec/manual/directory.md` の `(myghost)/shell/(additional_shell)/`（任意名称の追加シェルフォルダ）に対応し、`scan_shells_from_ghost` が `shell/` 内の任意サブディレクトリ（`.` 始まりを除く）をすべて検出し、`ghost/master/descript.txt` と各シェル直下の `descript.txt` をマージして切り替え可能にする。`resolve_shell_dir` / `shell_manifest` は VFS 大文字小文字吸収付きで任意のシェルディレクトリを解決し、`load_surface_image` も追加シェル側を優先探索する。

## 実装箇所

- `src-tauri/src/ghost/scan/shell/mod.rs:22` `if let Ok(entries) = std::fs::read_dir(&shell_base) {`
- `src-tauri/src/ghost/scan/shell/mod.rs:33` `let mut merged: HashMap<String, String> = master_descript.clone();`
- `src-tauri/src/commands/shell/manifest.rs:8` `pub fn resolve_shell_dir(`
- `src-tauri/src/commands/shell/manifest.rs:31` `pub fn shell_manifest(`
- `src-tauri/src/commands/file/surface_image.rs:33` `let shell_dir = base_ghost_path.join("shell").join(&sn);`
