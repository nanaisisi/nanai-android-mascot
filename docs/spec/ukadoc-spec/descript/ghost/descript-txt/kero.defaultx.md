# kero.defaultx,X座標

- **規格**: [kero.defaultx.md](https://ukatech.shillest.net/ukadoc-spec/descript/ghost/descript-txt/) (ukadoc-spec/descript/ghost/descript-txt/kero.defaultx.md)
- **検索語**: kero.defaultx
- **対応状況**: ✅ 対応済

## 突合結果

`src-tauri/src/ghost/scan/directory.rs` において `kero.defaultx` キーをパース・参照する実装が行われている。

## 実装箇所

- `src-tauri/src/ghost/scan/directory.rs:142` `// [kero.defaultleft,X座標], [kero.defaulttop,Y座標], [kero.defaultx,X座標], [kero.def`
- `src-tauri/src/ghost/scan/directory.rs:145` `let _kero_dx = m.get("kero.defaultx");`
- `src-tauri/src/ghost/scan/shell.rs:96` `// [kero.defaultleft,X座標], [kero.defaulttop,Y座標], [kero.defaultx,X座標], [kero.def`
