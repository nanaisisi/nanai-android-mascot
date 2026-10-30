# seriko.defaultsurfacedirectoryname,ディレクトリ名

- **規格**: [seriko.defaultsurfacedirectoryname.md](https://ukatech.shillest.net/ukadoc-spec/descript/ghost/descript-txt/) (ukadoc-spec/descript/ghost/descript-txt/seriko.defaultsurfacedirectoryname.md)
- **検索語**: seriko.defaultsurfacedirectoryname
- **対応状況**: ✅ 対応済

## 突合結果

`src-tauri/src/ghost/scan/directory.rs` において `seriko.defaultsurfacedirectoryname` キーをパース・参照する実装が行われている。

## 実装箇所

- `src-tauri/src/ghost/scan/directory.rs:166` `// [seriko.alignmenttodesktop,位置情報], [sakura.seriko.alignmenttodesktop,位置情報], [k`
- `src-tauri/src/ghost/scan/directory.rs:171` `let _seriko_dir = m.get("seriko.defaultsurfacedirectoryname");`
