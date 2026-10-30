# shiori.version,バージョン

- **規格**: [shiori.version.md](https://ukatech.shillest.net/ukadoc-spec/descript/ghost/descript-txt/) (ukadoc-spec/descript/ghost/descript-txt/shiori.version.md)
- **検索語**: shiori.version
- **対応状況**: ✅ 対応済

## 突合結果

`src-tauri/src/ghost/scan/directory.rs` において `shiori.version` キーをパース・参照する実装が行われている。

## 実装箇所

- `src-tauri/src/ghost/scan/directory.rs:165` `// [shiori.version,バージョン], [shiori.encoding,文字コード], [shiori.forceencoding,文字コード]`
- `src-tauri/src/ghost/scan/directory.rs:166` `let _shiori_ver = m.get("shiori.version");`
