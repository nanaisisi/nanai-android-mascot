# shiori.encoding,文字コード

- **規格**: [shiori.encoding.md](https://ukatech.shillest.net/ukadoc-spec/descript/ghost/descript-txt/) (ukadoc-spec/descript/ghost/descript-txt/shiori.encoding.md)
- **検索語**: shiori.encoding
- **対応状況**: ⚠️ 一部対応

## 突合結果

`src-tauri/src/ghost/scan/directory.rs` において `shiori.encoding` キーをパース・参照する実装が行われている。

## 実装箇所

- `src-tauri/src/ghost/scan/directory/manifest.rs:151` `.and_then(|m| m.get("shiori.encoding").cloned());`
- `src-tauri/src/shiori/property/tests.rs:21` `assert_eq!(evaluate_property_query("shiori.encoding"), "UTF-8");`
