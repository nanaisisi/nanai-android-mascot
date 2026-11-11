# makoto,ファイル名

- **規格**: [makoto.md](https://ukatech.shillest.net/ukadoc-spec/descript/ghost/descript-txt/) (ukadoc-spec/descript/ghost/descript-txt/makoto.md)
- **検索語**: makoto
- **対応状況**: ⚠️ 一部対応

## 突合結果

`src-tauri/src/ghost/scan/directory.rs` において `makoto` キーをパース・参照する実装が行われている。

## 実装箇所

- `src-tauri/src/commands/shell/ghost.rs:31` `makoto: manifest.makoto,`
- `src-tauri/src/common/models.rs:38` `pub makoto: Option<String>,`
- `src-tauri/src/ghost/scan/directory/manifest.rs:12` `pub makoto: Option<String>,`
- `src-tauri/src/ghost/scan/directory/manifest.rs:83` `let makoto = meta_map.as_ref().and_then(|m| m.get("makoto").cloned());`
- `src-tauri/src/ghost/scan/directory/manifest.rs:203` `makoto,`
