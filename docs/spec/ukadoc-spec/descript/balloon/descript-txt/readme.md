# readme,ファイル名

- **規格**: [readme.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/) (ukadoc-spec/descript/balloon/descript-txt/readme.md)
- **検索語**: readme
- **対応状況**: ⚠️ 一部対応

## 突合結果

`ui/js/core/actions/balloon-descript/assets.js` の `applyAssetProperties()` において `props["readme"]` を検出し、`--balloon-readme` カスタムプロパティへバインドする実装が行われている。

## 実装箇所

- `src-tauri/src/commands/ext.rs:48` `let _readme = map.get("readme");`
- `src-tauri/src/commands/ext.rs:49` `let _readme_cs = map.get("readme.charset");`
- `src-tauri/src/commands/ext.rs:117` `let _readme = map.get("readme");`
- `src-tauri/src/commands/ext.rs:118` `let _readme_cs = map.get("readme.charset");`
- `src-tauri/src/commands/install/archive/packaging.rs:136` `fs::write(source_dir.join("readme.txt"), "Ghost Readme\n").unwrap();`
