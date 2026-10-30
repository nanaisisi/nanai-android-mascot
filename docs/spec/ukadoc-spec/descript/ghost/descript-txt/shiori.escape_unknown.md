# shiori.escape_unknown,0/1

- **規格**: [shiori.escape_unknown.md](https://ukatech.shillest.net/ukadoc-spec/descript/ghost/descript-txt/) (ukadoc-spec/descript/ghost/descript-txt/shiori.escape_unknown.md)
- **検索語**: shiori.escape_unknown
- **対応状況**: ✅ 対応済

## 突合結果

`src-tauri/src/ghost/scan/directory.rs` において `shiori.escape_unknown` キーをパース・参照する実装が行われている。

## 実装箇所

- `src-tauri/src/ghost/scan/directory.rs:166` `// [shiori.version,バージョン], [shiori.encoding,文字コード], [shiori.forceencoding,文字コード]`
- `src-tauri/src/ghost/scan/directory.rs:171` `let _shiori_esc = m.get("shiori.escape_unknown");`
