# `shell/master/descript.txt`

- **規格**: [shell.md](../../../../ukadoc-spec/manual/shell.md) ([公式版](https://ukatech.shillest.net/ukadoc-spec/manual/shell/))
- **検索語**: read_descript
- **対応状況**: ✅ 実装済

## 突合結果

`read_descript`・`Shell::load`・`scan_shells_from_ghost`・`shell_manifest` により、`shell/<name>/descript.txt` を大文字小文字非区別で読み込み、`Descript` / `ShellManifest` / `ShellInfo` へシェル識別名・作者名・`bindgroup` 着せ替え定義・オーナードローメニュー設定・`seriko.*` 拡張設定を反映する実装および単体テストが完了している。

## 実装箇所

- `crates/ui/src/shell/loader.rs:6` `pub(crate) fn read_descript(directory: &Path) -> Option<Descript> {`
- `crates/ui/src/shell/core.rs:57` `let descript = read_descript(directory).unwrap_or_default();`
- `src-tauri/src/ghost/scan/shell/mod.rs:30` `let descript_path = path.join("descript.txt");`
- `src-tauri/src/commands/shell/manifest.rs:31` `pub fn shell_manifest(`
- `crates/ui/src/manifest/shell_manifest.rs:13` `pub struct ShellManifest {`
- `crates/ui/src/shell/tests.rs:11` `fn test_load_mock_shell() {`
