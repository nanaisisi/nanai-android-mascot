# craftmanw,作者名

- **規格**: [craftmanw.md](https://ukatech.shillest.net/ukadoc-spec/descript/ghost/descript-txt/) (ukadoc-spec/descript/ghost/descript-txt/craftmanw.md)
- **検索語**: craftmanw
- **対応状況**: ⚠️ 一部対応

## 突合結果

`src-tauri/src/ghost/scan/directory/manifest/parser.rs` および `crates/nanai-core/src/descript_parser/types.rs` (`craftman_w`) において `craftmanw` キー（`craftman` のフォールバック）のパースおよび取得が完全実装済み。

## 実装箇所

- `crates/nanai-core/src/descript_parser/types.rs:198` `self.get("craftmanw")`
- `src-tauri/src/commands/ext.rs:40` `.or_else(|| map.get("craftmanw").cloned());`
- `crates/ui/src/descript/tests.rs:84` `assert_eq!(desc.craftmanw().unwrap(), "Author");`
- `src-tauri/src/commands/ext.rs:105` `.or_else(|| map.get("craftmanw").cloned());`
- `crates/ui/src/descript/tests.rs:90` `let sample2 = "craftmanw,AuthorW\ncraftman,Author\n";`
- `src-tauri/src/ghost/scan/directory/manifest/parser.rs:57` `.or_else(|| m.get("craftmanw").cloned())`
