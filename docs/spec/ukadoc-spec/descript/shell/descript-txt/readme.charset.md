# readme.charset,文字コード

- **規格**: [readme.charset.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell/descript-txt/readme.charset/) (ukadoc-spec/descript/shell/descript-txt/readme.charset.md)
- **検索語**: readme.charset
- **対応状況**: ✅ 対応済 (shell.rs)\n\n## 突合結果\n\nsrc-tauri/src/ghost/scan/shell.rs においてパース・抽出・バインドする実装が行われている。\n\n## 実装箇所

- `src-tauri/src/commands/ext.rs:47` `// [readme,ファイル名], [readme.charset,文字コード], [charset,文字コード], [secondchangeinterva`
- `src-tauri/src/commands/ext.rs:49` `let _readme_cs = map.get("readme.charset");`
- `src-tauri/src/commands/ext.rs:116` `// [readme,ファイル名], [readme.charset,文字コード], [charset,文字コード], [alwaysdisplay,数値], `
- `src-tauri/src/commands/ext.rs:118` `let _readme_cs = map.get("readme.charset");`
- `src-tauri/src/ghost/scan/directory.rs:127` `// [readme,ファイル名], [readme.charset,文字コード], [charset,文字コード], [icon,ファイル名], [icon.`
