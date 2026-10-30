# name.allowoverride,数値

- **規格**: [name.allowoverride.md](https://ukatech.shillest.net/ukadoc-spec/descript/ghost/descript-txt/) (ukadoc-spec/descript/ghost/descript-txt/name.allowoverride.md)
- **検索語**: name.allowoverride
- **対応状況**: ✅ 対応済

## 突合結果

`src-tauri/src/ghost/scan/directory.rs` において `name.allowoverride` キーをパース・参照する実装が行われている。

## 実装箇所

- `src-tauri/src/ghost/scan/directory.rs:189` `// [name.allowoverride,数値], [makoto,ファイル名], [補足]:`
- `src-tauri/src/ghost/scan/directory.rs:190` `let _name_override = m.get("name.allowoverride");`
