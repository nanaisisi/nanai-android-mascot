# charset,文字コード

- **規格**: [charset.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell/descript-txt/charset/) (ukadoc-spec/descript/shell/descript-txt/charset.md)
- **検索語**: charset
- **対応状況**: ⚠️ 一部対応(読込のみ)

## 突合結果

ghost/scan.rs 等で descript の値を読込している。表示・動作への反映は個別未確認。

## 実装箇所

- `src-tauri/src/commands/ext.rs:41` `// [readme,ファイル名], [readme.charset,文字コード], [charset,文字コード], [secondchangeinterva`
- `src-tauri/src/commands/ext.rs:43` `let _readme_cs = map.get("readme.charset");`
- `src-tauri/src/commands/ext.rs:44` `let _cs = map.get("charset");`
- `src-tauri/src/commands/ext.rs:101` `// [readme,ファイル名], [readme.charset,文字コード], [charset,文字コード], [alwaysdisplay,数値], `
- `src-tauri/src/commands/ext.rs:103` `let _readme_cs = map.get("readme.charset");`
