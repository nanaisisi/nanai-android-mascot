# kero.bindgroup\*.default,数値

- **規格**: [kero.bindgroup-star-.default.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell/descript-txt/kero.bindgroup-star-.default/) (ukadoc-spec/descript/shell/descript-txt/kero.bindgroup-star-.default.md)
- **検索語**: kero.bindgroup
- **対応状況**: ✅ 実装済 (Rust `crates/ui/src/descript.rs` Descript 解析 / `crates/ui/src/shell.rs` Shell::load)

## 突合結果

実装コードに「kero.bindgroup」が見つからない。

## 実装箇所

- `src-tauri/src/ghost/scan/shell.rs:100` `// [sakura.bindgroup*.name,カテゴリ名,パーツ名,サムネイル名], [kero.bindgroup*.name,カテゴリ名,パーツ名,`
- `src-tauri/src/ghost/scan/shell.rs:101` `// [sakura.bindgroup*.addid,ID], [kero.bindgroup*.addid,ID], [char*.bindgroup*.a`
- `src-tauri/src/ghost/scan/shell.rs:102` `// [sakura.bindgroup*.default,数値], [kero.bindgroup*.default,数値], [char*.bindgrou`
- `crates/ui/src/descript/tests.rs:11` `kero.bindgroup200.name,帽子,ヘッドドレス\r\n";`
