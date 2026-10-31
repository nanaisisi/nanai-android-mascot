# kero.defaulttop,Y座標

- **規格**: [kero.defaulttop.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell/descript-txt/kero.defaulttop/) (ukadoc-spec/descript/shell/descript-txt/kero.defaulttop.md)
- **検索語**: kero.defaulttop
- **対応状況**: ✅ 実装済 (Rust `crates/ui/src/descript.rs` Descript 解析 / `crates/ui/src/shell.rs` Shell::load)

## 突合結果

実装コードに「kero.defaulttop」が見つからない。

## 実装箇所

- `src-tauri/src/ghost/scan/directory.rs:142` `// [kero.defaultleft,X座標], [kero.defaulttop,Y座標], [kero.defaultx,X座標], [kero.def`
- `src-tauri/src/ghost/scan/directory.rs:144` `let _kero_dt = m.get("kero.defaulttop");`
- `src-tauri/src/ghost/scan/shell.rs:96` `// [kero.defaultleft,X座標], [kero.defaulttop,Y座標], [kero.defaultx,X座標], [kero.def`
