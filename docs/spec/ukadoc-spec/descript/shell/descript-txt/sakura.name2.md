# sakura.name2,名前

- **規格**: [sakura.name2.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell/descript-txt/sakura.name2/) (ukadoc-spec/descript/shell/descript-txt/sakura.name2.md)
- **検索語**: sakura.name2
- **対応状況**: ✅ 実装済 (Rust `crates/ui/src/descript.rs` Descript 解析 / `crates/ui/src/shell.rs` Shell::load)

## 突合結果

実装コードに「sakura.name2」が見つからない。


## 実装箇所

- `src-tauri/src/ghost/scan/directory.rs:99` `// [version,バージョン], [sakura.name,名前], [sakura.name2,名前], [kero.name,名前], [char*.`
- `src-tauri/src/ghost/scan/directory.rs:103` `.and_then(|m| m.get("sakura.name").cloned().or_else(|| m.get("sakura.name2").clo`
- `src-tauri/src/ghost/scan/shell.rs:91` `// [sakura.name,名前], [sakura.name2,名前], [kero.name,名前], [char*.name,名前]:`
- `crates/ui/src/descript/parser.rs:111` `/// さくら（本体）の正式名とサブ表示名（`sakura.name`, `sakura.name2`）`
- `crates/ui/src/descript/parser.rs:113` `(self.get("sakura.name"), self.get("sakura.name2"))`
