# char*.name,名前

- **規格**: [char-star-.name.md](https://ukatech.shillest.net/ukadoc-spec/descript/ghost/descript-txt/) (ukadoc-spec/descript/ghost/descript-txt/char-star-.name.md)
- **検索語**: char*.name
- **対応状況**: ✅ 対応済

## 突合結果

`src-tauri/src/ghost/scan/directory.rs` において `char*.name` キー群をパース・参照する実装が行われている。

## 実装箇所

- `src-tauri/src/ghost/scan/directory.rs:105` `// [version,バージョン], [sakura.name,名前], [sakura.name2,名前], [kero.name,名前], [char*.`
- `src-tauri/src/ghost/scan/directory.rs:148` `// [char*.defaultleft,X座標], [char*.defaulttop,Y座標], [char*.defaultx,X座標], [char*`
- `src-tauri/src/ghost/scan/shell.rs:91` `// [sakura.name,名前], [sakura.name2,名前], [kero.name,名前], [char*.name,名前]:`
