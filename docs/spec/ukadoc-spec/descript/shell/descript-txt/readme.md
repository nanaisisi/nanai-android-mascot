# readme,ファイル名

- **規格**: [readme.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell/descript-txt/) (ukadoc-spec/descript/shell/descript-txt/readme.md)
- **検索語**: readme
- **対応状況**: ⚠️ 一部対応

## 突合結果

`src-tauri/src/ghost/scan/shell.rs` においてシェルの `descript.txt` 内の `readme` キーをパースし、情報を参照・利用する実装が行われている。

## 実装箇所

- `src-tauri/src/commands/ext.rs:48` `let _readme = map.get("readme");`
- `src-tauri/src/commands/ext.rs:49` `let _readme_cs = map.get("readme.charset");`
- `src-tauri/src/commands/ext.rs:117` `let _readme = map.get("readme");`
- `src-tauri/src/commands/ext.rs:118` `let _readme_cs = map.get("readme.charset");`
- `src-tauri/src/commands/install/archive/packaging.rs:136` `fs::write(source_dir.join("readme.txt"), "Ghost Readme\n").unwrap();`
