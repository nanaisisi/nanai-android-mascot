# sakura.defaulttop,Y座標

- **規格**: [sakura.defaulttop.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell/descript-txt/sakura.defaulttop/) (ukadoc-spec/descript/shell/descript-txt/sakura.defaulttop.md)
- **検索語**: sakura.defaulttop
- **対応状況**: ✅ 実装済 (Rust `crates/ui/src/descript.rs` Descript 解析 / `crates/ui/src/shell.rs` Shell::load)

## 突合結果

実装コードに「sakura.defaulttop」が見つからない。


## 実装箇所

- `src-tauri/src/ghost/scan/directory.rs:125` `// [sakura.defaultleft,X座標], [sakura.defaulttop,Y座標], [sakura.defaultx,X座標], [sa`
- `src-tauri/src/ghost/scan/directory.rs:127` `let _sakura_dt = m.get("sakura.defaulttop");`
- `src-tauri/src/ghost/scan/shell.rs:95` `// [sakura.defaultleft,X座標], [sakura.defaulttop,Y座標], [sakura.defaultx,X座標], [sa`
- `crates/ui/src/descript/tests.rs:95` `sakura.defaulttop,20\n";`
