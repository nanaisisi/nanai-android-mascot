# shiori.version,バージョン

- **規格**: [shiori.version.md](https://ukatech.shillest.net/ukadoc-spec/descript/ghost/descript-txt/) (ukadoc-spec/descript/ghost/descript-txt/shiori.version.md)
- **検索語**: shiori.version
- **対応状況**: ⚠️ 一部対応

## 突合結果

`src-tauri/src/ghost/scan/directory/manifest/parser.rs` および SHIORI プロパティ評価系において `shiori.version` キーのパースおよびバージョン情報返却が完全実装済み。

## 実装箇所

- `crates/nanai-core/src/descript_parser/types.rs:66` `/// SHIORI バージョン (`shiori.version`)`
- `src-tauri/src/ghost/scan/directory/manifest/parser.rs:115` `.and_then(|m| m.get("shiori.version").cloned());`
- `crates/nanai-core/src/descript_parser/types.rs:68` `self.get("shiori.version")`
- `src-tauri/src/shiori/property/tests.rs:30` `assert_eq!(evaluate_property_query("shiori.version"), "3.0");`
