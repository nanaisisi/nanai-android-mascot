# readme.charset,文字コード

- **規格**: [readme.charset.md](https://ukatech.shillest.net/ukadoc-spec/descript/plugin/descript-txt/) (ukadoc-spec/descript/plugin/descript-txt/readme.charset.md)
- **検索語**: readme.charset
- **対応状況**: ✅ 対応済

## 突合結果

`src-tauri/src/commands/ext.rs` において `readme.charset` キーをパース・参照する実装が行われている。

## 実装箇所

- `src-tauri/src/commands/ext.rs:41` `// [readme,ファイル名], [readme.charset,文字コード], [charset,文字コード], [secondchangeinterva`
- `src-tauri/src/commands/ext.rs:43` `let _readme_cs = map.get("readme.charset");`
- `src-tauri/src/commands/ext.rs:101` `// [readme,ファイル名], [readme.charset,文字コード], [charset,文字コード], [alwaysdisplay,数値], `
- `src-tauri/src/commands/ext.rs:103` `let _readme_cs = map.get("readme.charset");`
- `src-tauri/src/ghost/scan/directory.rs:116` `// [readme,ファイル名], [readme.charset,文字コード], [charset,文字コード], [icon,ファイル名], [icon.`
