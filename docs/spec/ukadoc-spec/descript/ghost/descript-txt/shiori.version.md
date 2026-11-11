# shiori.version,バージョン

- **規格**: [shiori.version.md](https://ukatech.shillest.net/ukadoc-spec/descript/ghost/descript-txt/) (ukadoc-spec/descript/ghost/descript-txt/shiori.version.md)
- **検索語**: shiori.version
- **対応状況**: ⚠️ 一部対応

## 突合結果

`src-tauri/src/ghost/scan/directory.rs` において `shiori.version` キーをパース・参照する実装が行われている。

## 実装箇所

- `src-tauri/src/ghost/scan/directory/manifest.rs:145` `.and_then(|m| m.get("shiori.version").cloned());`
- `src-tauri/src/shiori/property/tests.rs:16` `assert_eq!(evaluate_property_query("shiori.version"), "3.0");`
