# shiori.forceencoding,文字コード

- **規格**: [shiori.forceencoding.md](https://ukatech.shillest.net/ukadoc-spec/descript/ghost/descript-txt/) (ukadoc-spec/descript/ghost/descript-txt/shiori.forceencoding.md)
- **検索語**: shiori.forceencoding
- **対応状況**: ✅ 対応済

## 突合結果

`src-tauri/src/ghost/scan/directory.rs` において `shiori.forceencoding` キーをパース・参照する実装が行われている。

## 実装箇所

- `src-tauri/src/ghost/scan/directory.rs:165` `// [shiori.version,バージョン], [shiori.encoding,文字コード], [shiori.forceencoding,文字コード]`
- `src-tauri/src/ghost/scan/directory.rs:168` `let _shiori_fenc = m.get("shiori.forceencoding");`
