# menu.background.bitmap.filename

- **規格**: [menu.background.bitmap.filename.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-resource/ownerdraw-image/menu.background.bitmap.filename/) (ukadoc-spec/list/shiori-resource/ownerdraw-image/menu.background.bitmap.filename.md)
- **検索語**: menu.background.bitmap.filename
- **対応状況**: ✅ 実装済

## 突合結果

ghost/scan.rs で descript.txt から読込 (表示への反映は未確認)。

## 実装箇所

- `src-tauri/src/ghost/scan/shell/theme.rs:44` `.get("menu.background.bitmap.filename")`
- `ui/js/ghost/ghost-shiori.js:178` `* @param {string} resourceId リソース名 (例: "menu.background.bitmap.filename", "updat`
- `ui/js/ghost/shiori-notify.js:32` `* - menu.background.bitmap.filename, menu.foreground.bitmap.filename, menu.sideb`
