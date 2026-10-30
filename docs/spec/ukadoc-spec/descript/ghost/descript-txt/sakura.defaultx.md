# sakura.defaultx,X座標

- **規格**: [sakura.defaultx.md](https://ukatech.shillest.net/ukadoc-spec/descript/ghost/descript-txt/) (ukadoc-spec/descript/ghost/descript-txt/sakura.defaultx.md)
- **検索語**: sakura.defaultx
- **対応状況**: ✅ 対応済

## 突合結果

`src-tauri/src/ghost/scan/directory.rs` において `sakura.defaultx` キーをパース・参照する実装が行われている。

## 実装箇所

- `src-tauri/src/ghost/scan/directory.rs:125` `// [sakura.defaultleft,X座標], [sakura.defaulttop,Y座標], [sakura.defaultx,X座標], [sa`
- `src-tauri/src/ghost/scan/directory.rs:128` `let _sakura_dx = m.get("sakura.defaultx");`
- `src-tauri/src/ghost/scan/shell.rs:95` `// [sakura.defaultleft,X座標], [sakura.defaulttop,Y座標], [sakura.defaultx,X座標], [sa`
- `crates/ui/src/descript/tests.rs:6` `sakura.defaultx,120\r\nsakura.defaulty,240\r\n\`
