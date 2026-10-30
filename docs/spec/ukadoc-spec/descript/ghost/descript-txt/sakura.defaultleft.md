# sakura.defaultleft,X座標

- **規格**: [sakura.defaultleft.md](https://ukatech.shillest.net/ukadoc-spec/descript/ghost/descript-txt/) (ukadoc-spec/descript/ghost/descript-txt/sakura.defaultleft.md)
- **検索語**: sakura.defaultleft
- **対応状況**: ✅ 対応済

## 突合結果

`src-tauri/src/ghost/scan/directory.rs` において `sakura.defaultleft` キーをパース・参照する実装が行われている。

## 実装箇所

- `src-tauri/src/ghost/scan/directory.rs:125` `// [sakura.defaultleft,X座標], [sakura.defaulttop,Y座標], [sakura.defaultx,X座標], [sa`
- `src-tauri/src/ghost/scan/directory.rs:126` `let _sakura_dl = m.get("sakura.defaultleft");`
- `src-tauri/src/ghost/scan/shell.rs:95` `// [sakura.defaultleft,X座標], [sakura.defaulttop,Y座標], [sakura.defaultx,X座標], [sa`
- `crates/ui/src/descript/tests.rs:94` `sakura.defaultleft,10\n\`
