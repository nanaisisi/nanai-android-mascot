# charset,文字コード

- **規格**: [charset.md](https://ukatech.shillest.net/ukadoc-spec/descript/install/install-txt/) (ukadoc-spec/descript/install/install-txt/charset.md)
- **検索語**: charset
- **対応状況**: ✅ 対応済

## 突合結果

`src-tauri/src/commands/install/archive.rs` において `charset` キーをパース・参照する実装が行われている。

## 実装箇所

- `src-tauri/src/commands/ext.rs:41` `// [readme,ファイル名], [readme.charset,文字コード], [charset,文字コード], [secondchangeinterva`
- `src-tauri/src/commands/ext.rs:43` `let _readme_cs = map.get("readme.charset");`
- `src-tauri/src/commands/ext.rs:44` `let _cs = map.get("charset");`
- `src-tauri/src/commands/ext.rs:101` `// [readme,ファイル名], [readme.charset,文字コード], [charset,文字コード], [alwaysdisplay,数値], `
- `src-tauri/src/commands/ext.rs:103` `let _readme_cs = map.get("readme.charset");`
