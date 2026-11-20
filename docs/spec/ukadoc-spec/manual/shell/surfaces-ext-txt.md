# `surfaces**.txt`

- **規格**: [shell.md](../../../../ukadoc-spec/manual/shell.md) ([公式版](https://ukatech.shillest.net/ukadoc-spec/manual/shell/))
- **検索語**: surfaces2.txt
- **対応状況**: ✅ 実装済

## 突合結果

`Shell::load` と `SurfacesTxt::merge` により、`surfaces.txt` 読み込み後に同ディレクトリ内の全 `surfaces*.txt`（`surfaces2.txt` 等の分割・拡張ファイル）をファイル名順（大文字小文字非区別）にソートして順次パース・マージする（`crates/ui/src/shell/tests.rs` の `test_shell_loads_sorted_surfaces_split_files` でテスト済み）。

## 実装箇所

- `crates/ui/src/shell/core.rs:62` `// surfaces*.txt（surfaces2.txt 等の SSP 拡張・分割ファイル）をファイル名順でマージ`
- `crates/nanai-surface/src/types/txt/surfaces_txt/core/merge.rs:7` `pub fn merge(&mut self, other: SurfacesTxt) {`
- `crates/ui/src/shell/tests.rs:98` `fn test_shell_loads_sorted_surfaces_split_files() {`
