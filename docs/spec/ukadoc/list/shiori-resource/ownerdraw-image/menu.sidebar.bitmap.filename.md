# menu.sidebar.bitmap.filename

- **規格**: [menu.sidebar.bitmap.filename.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-resource/ownerdraw-image/menu.sidebar.bitmap.filename/) (ukadoc-spec/list/shiori-resource/ownerdraw-image/menu.sidebar.bitmap.filename.md)
- **検索語**: menu.sidebar.bitmap.filename
- **対応状況**: ⚠️ 一部対応(読込のみ)

## 突合結果

ghost/scan.rs で descript.txt から読込 (表示への反映は未確認)。

## 実装箇所

- `src-tauri/src/ghost/scan.rs:106`  `let side_bmp = map.get("menu.sidebar.bitmap.filename").cloned();`
