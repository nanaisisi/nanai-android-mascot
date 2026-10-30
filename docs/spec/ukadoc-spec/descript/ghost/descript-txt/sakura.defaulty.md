# sakura.defaulty,Y座標

- **規格**: [sakura.defaulty.md](https://ukatech.shillest.net/ukadoc-spec/descript/ghost/descript-txt/) (ukadoc-spec/descript/ghost/descript-txt/sakura.defaulty.md)
- **検索語**: sakura.defaulty
- **対応状況**: ✅ 対応済

## 突合結果

`src-tauri/src/ghost/scan/directory.rs` において `sakura.defaulty` キーをパース・参照する実装が行われている。

## 実装箇所

- `src-tauri/src/ghost/scan/directory.rs:125` `// [sakura.defaultleft,X座標], [sakura.defaulttop,Y座標], [sakura.defaultx,X座標], [sa`
- `src-tauri/src/ghost/scan/directory.rs:129` `let _sakura_dy = m.get("sakura.defaulty");`
- `src-tauri/src/ghost/scan/shell.rs:95` `// [sakura.defaultleft,X座標], [sakura.defaulttop,Y座標], [sakura.defaultx,X座標], [sa`
- `crates/ui/src/descript/tests.rs:6` `sakura.defaultx,120\r\nsakura.defaulty,240\r\n\`
