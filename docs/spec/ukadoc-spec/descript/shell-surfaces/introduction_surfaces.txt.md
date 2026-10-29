# surfaces.txt

- **規格**: [introduction_surfaces.txt.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell-surfaces/introduction_surfaces.txt/) (ukadoc-spec/descript/shell-surfaces/introduction_surfaces.txt.md)
- **検索語**: surfaces.txt
- **対応状況**: ⚠️ 一部対応 (Rust パーサー `crates/ui/src/surfaces.rs` で解析・データ化実装済 / 描画・実行への反映は別レイヤー)

## 突合結果

surface-parser.js / surface-animation-manager.js に該当の解析・処理は確認できない。

## 実装箇所

- `src-tauri/src/commands/shell/mod.rs:3` `//! ukadoc-spec のシェル定義（descript.txt / surfaces.txt / surfacetable.txt）`
- `crates/ui/src/shell.rs:3` `//! シェルディレクトリから `descript.txt`/`surfaces.txt`/`surfacetable.txt``
- `crates/ui/src/shell.rs:20` `/// `surfaces.txt`（Element / SERIKO / Collision）`
- `crates/ui/src/shell.rs:27` `/// シェルディレクトリを読み込む。`surfaces.txt` が無い場合はエラー。`
- `crates/ui/src/shell.rs:35` `let surfaces_path = resolve_vfs_path(directory, "surfaces.txt")`
