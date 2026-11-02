# surfacetable.txt

- **規格**: [introduction_surfacetable.txt.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell-surfacetable/introduction_surfacetable.txt/) (ukadoc-spec/descript/shell-surfacetable/introduction_surfacetable.txt.md)
- **検索語**: surfacetable.txt
- **対応状況**: ✅ 対応済 (surfacetable.rs)

## 突合結果

実装コードに「surfacetable.txt」が見つからない。

## 実装箇所

- `src-tauri/src/commands/shell/mod.rs:3` `//! ukadoc-spec のシェル定義（descript.txt / surfaces.txt / surfacetable.txt）`
- `crates/ui/src/manifest.rs:43` `/// `surfacetable.txt` パース結果（任意）`
- `crates/ui/src/shell.rs:3` `//! シェルディレクトリから `descript.txt`/`surfaces.txt`/`surfacetable.txt``
- `crates/ui/src/shell.rs:22` `/// `surfacetable.txt`（任意・サーフィスグループ一覧）`
- `crates/ui/src/shell.rs:48` `let surface_table = resolve_vfs_path(directory, "surfacetable.txt")`
