# shiori.cache,数値

- **規格**: [shiori.cache.md](https://ukatech.shillest.net/ukadoc-spec/descript/ghost/descript-txt/) (ukadoc-spec/descript/ghost/descript-txt/shiori.cache.md)
- **検索語**: shiori.cache
- **対応状況**: ✅ 対応済

## 突合結果

`src-tauri/src/ghost/scan/directory.rs` において `shiori.cache` キーをパース・参照する実装が行われている。

## 実装箇所

- `src-tauri/src/ghost/scan/directory.rs:166` `// [shiori.version,バージョン], [shiori.encoding,文字コード], [shiori.forceencoding,文字コード]`
- `src-tauri/src/ghost/scan/directory.rs:170` `let _shiori_cache = m.get("shiori.cache");`
