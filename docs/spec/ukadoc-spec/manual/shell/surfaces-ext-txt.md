# `surfaces**.txt`

- **規格**: [shell.md](../../../../ukadoc-spec/manual/shell.md) ([公式版](https://ukatech.shillest.net/ukadoc-spec/manual/shell/))
- **検索語**: surfaces2.txt
- **対応状況**: ⚠️ 一部対応

## 突合結果

`Shell::load` と `SurfacesTxt::merge` により、`surfaces.txt` 読み込み後に `surfaces2.txt` が存在する場合は上書き・追記マージする（`crates/ui/src/shell/tests.rs` でテスト済み）。一方、`surfaces2.txt` 以外の任意ファイル名 `surfaces**.txt` をディレクトリ列挙で順次読み込む処理、および `SurfaceManager::loadSurfacesTxt` の直接 `open_file` / `fetch` フォールバック経路での追加読み込みは未実装。

## 実装箇所

- `crates/ui/src/shell/core.rs:63` `if let Some(s2_path) = resolve_vfs_path(directory, "surfaces2.txt").filter(|p| p.is_file())`
- `crates/nanai-surface/src/types/txt/surfaces_txt/core/merge.rs:7` `pub fn merge(&mut self, other: SurfacesTxt) {`
- `ui/ts/surface/surface-manager.ts:806` `const surfacesPath = `${basePath}/shell/${shell}/surfaces.txt`;`
- `crates/ui/src/shell/tests.rs:75` `fn test_shell_hit_test_results_and_surfaces2() {`
