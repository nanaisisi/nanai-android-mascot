# seriko.alignmenttodesktop,位置情報

- **規格**: [seriko.alignmenttodesktop.md](https://ukatech.shillest.net/ukadoc-spec/descript/ghost/descript-txt/) (ukadoc-spec/descript/ghost/descript-txt/seriko.alignmenttodesktop.md)
- **検索語**: seriko.alignmenttodesktop
- **対応状況**: ✅ 対応済

## 突合結果

`src-tauri/src/ghost/scan/directory.rs` において `seriko.alignmenttodesktop` キーをパース・参照する実装が行われている。

## 実装箇所

- `src-tauri/src/ghost/scan/directory.rs:155` `// [seriko.alignmenttodesktop,位置情報], [sakura.seriko.alignmenttodesktop,位置情報], [k`
- `src-tauri/src/ghost/scan/directory.rs:156` `let _seriko_align = m.get("seriko.alignmenttodesktop");`
- `src-tauri/src/ghost/scan/directory.rs:157` `let _sakura_seriko_align = m.get("sakura.seriko.alignmenttodesktop");`
- `src-tauri/src/ghost/scan/directory.rs:158` `let _kero_seriko_align = m.get("kero.seriko.alignmenttodesktop");`
- `src-tauri/src/ghost/scan/directory.rs:159` `let _char_seriko_align = m.get("char0.seriko.alignmenttodesktop");`
