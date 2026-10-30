# shiori.encoding,文字コード

- **規格**: [shiori.encoding.md](https://ukatech.shillest.net/ukadoc-spec/descript/ghost/descript-txt/) (ukadoc-spec/descript/ghost/descript-txt/shiori.encoding.md)
- **検索語**: shiori.encoding
- **対応状況**: ✅ 対応済

## 突合結果

`src-tauri/src/ghost/scan/directory.rs` において `shiori.encoding` キーをパース・参照する実装が行われている。

## 実装箇所

- `src-tauri/src/ghost/scan/directory.rs:177` `// [shiori.version,バージョン], [shiori.encoding,文字コード], [shiori.forceencoding,文字コード]`
- `src-tauri/src/ghost/scan/directory.rs:179` `let _shiori_enc = m.get("shiori.encoding");`
