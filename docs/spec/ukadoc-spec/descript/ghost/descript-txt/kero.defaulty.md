# kero.defaulty,Y座標

- **規格**: [kero.defaulty.md](https://ukatech.shillest.net/ukadoc-spec/descript/ghost/descript-txt/) (ukadoc-spec/descript/ghost/descript-txt/kero.defaulty.md)
- **検索語**: kero.defaulty
- **対応状況**: ✅ 対応済

## 突合結果

`src-tauri/src/ghost/scan/directory.rs` において `kero.defaulty` キーをパース・参照する実装が行われている。

## 実装箇所

- `src-tauri/src/ghost/scan/directory.rs:131` `// [kero.defaultleft,X座標], [kero.defaulttop,Y座標], [kero.defaultx,X座標], [kero.def`
- `src-tauri/src/ghost/scan/directory.rs:135` `let _kero_dy = m.get("kero.defaulty");`
- `src-tauri/src/ghost/scan/shell.rs:96` `// [kero.defaultleft,X座標], [kero.defaulttop,Y座標], [kero.defaultx,X座標], [kero.def`
