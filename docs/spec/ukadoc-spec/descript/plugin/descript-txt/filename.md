# filename,dll

- **規格**: [filename.md](https://ukatech.shillest.net/ukadoc-spec/descript/plugin/descript-txt/) (ukadoc-spec/descript/plugin/descript-txt/filename.md)
- **検索語**: filename
- **対応状況**: ✅ 対応済

## 突合結果

`src-tauri/src/commands/ext.rs` において `filename` キーをパース・参照する実装が行われている。

## 実装箇所

- `src-tauri/src/commands/ext.rs:33` `// [name,プラグイン名], [id,ID名], [type,種別], [filename,ファイル名]:`
- `src-tauri/src/commands/shiori/lifecycle/load.rs:34` `&& let Some(shiori_filename) = map.get("shiori")`
- `src-tauri/src/commands/shiori/lifecycle/load.rs:36` `let rel_path = shiori_filename.trim();`
- `src-tauri/src/commands/shiori/lifecycle/spawn.rs:27` `&& let Some(shiori_filename) = map.get("shiori")`
- `src-tauri/src/commands/shiori/lifecycle/spawn.rs:29` `let rel_path = shiori_filename.trim();`
