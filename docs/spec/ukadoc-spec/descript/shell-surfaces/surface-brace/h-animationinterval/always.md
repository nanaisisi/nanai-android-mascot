# always

- **規格**: [always.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell-surfaces/surface-brace/h-animationinterval/always/) (ukadoc-spec/descript/shell-surfaces/surface-brace/h-animationinterval/always.md)
- **検索語**: always
- **対応状況**: ✅ 実装済


## 実装箇所

- `src-tauri/tauri.conf.json:22` `"alwaysOnTop": true,`
- `src-tauri/src/commands/ext.rs:116` `// [readme,ファイル名], [readme.charset,文字コード], [charset,文字コード], [alwaysdisplay,数値], `
- `src-tauri/src/commands/ext.rs:120` `let _always_disp = map.get("alwaysdisplay");`
- `src-tauri/src/commands/window/loading_banner_window.rs:71` `.always_on_top(true)`
- `src-tauri/src/commands/window/character_window.rs:68` `.always_on_top(true)`
