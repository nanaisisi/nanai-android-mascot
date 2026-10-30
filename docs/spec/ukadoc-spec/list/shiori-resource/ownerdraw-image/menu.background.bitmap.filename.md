# menu.background.bitmap.filename

- **規格**: [menu.background.bitmap.filename.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-resource/ownerdraw-image/menu.background.bitmap.filename/) (ukadoc-spec/list/shiori-resource/ownerdraw-image/menu.background.bitmap.filename.md)
- **検索語**: menu.background.bitmap.filename
- **対応状況**: ⚠️ 一部対応(読込のみ)

## 突合結果

ghost/scan.rs で descript.txt から読込 (表示への反映は未確認)。

## 実装箇所

- `src-tauri/src/ghost/scan/shell.rs:149` `// [menu.background.bitmap.filename,ファイル名], [menu.foreground.bitmap.filename,ファイ`
- `src-tauri/src/ghost/scan/shell.rs:152` `.get("menu.background.bitmap.filename")`
