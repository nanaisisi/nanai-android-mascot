# (myghost)/ghost/master/

- **規格**: [directory.md](../../../../ukadoc-spec/manual/directory.md) ([公式版](https://ukatech.shillest.net/ukadoc-spec/manual/directory/))
- **検索語**: ghost/master
- **対応状況**: ✅ 実装済

## 突合結果

`docs/ukadoc-spec/manual/directory.md` の `(myghost)/ghost/` およびデフォルトフォルダ `(myghost)/ghost/master/` に対応し、`parse_ghost_manifest` が `ghost/master/descript.txt` を最優先で読み込み、`load_ghost` および `spawn_ghost` が `ghost/master/` を基準ディレクトリとして SHIORI ライブラリ探索と `load()` 初期化を行う。アーカイブ検査 `inspect_zip_archive` でも `ghost/master/descript.txt` を最優先のマニフェストとして認識する。

## 実装箇所

- `src-tauri/src/ghost/scan/directory/manifest/parser.rs:10` `path.join("ghost").join("master").join("descript.txt"),`
- `src-tauri/src/commands/shiori/lifecycle/load.rs:33` `let ghost_master_dir = ghost_dir.join("ghost").join("master");`
- `src-tauri/src/commands/shiori/lifecycle/spawn.rs:23` `let ghost_master_dir = ghost_dir.join("ghost").join("master");`
- `src-tauri/src/commands/install/archive/inspection/analyzer/zip_inspector.rs:27` `let prio = if lower.ends_with("ghost/master/descript.txt") {`
- `src-tauri/src/ghost/scan/date.rs:66` `let master_dir = path.join("ghost").join("master");`
