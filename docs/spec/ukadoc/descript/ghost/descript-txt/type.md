# type,種別

- **規格**: [type.md](https://ukatech.shillest.net/ukadoc-spec/descript/ghost/descript-txt/type/) (ukadoc-spec/descript/ghost/descript-txt/type.md)
- **検索語**: type
- **対応状況**: 🔎 コード上に出現(処理の有無は要読解)

## 突合結果

実装コードに「type」が出現。実際の処理内容は未精査。

## 実装箇所

- `src-tauri/src/commands/window/menu_window.rs:97`  `menu_type: String,`
- `src-tauri/src/commands/window/menu_window.rs:158`  `let _ = app_handle.emit("set-submenu-type", serde_json::json!({ "type": menu_type }));`
- `ui/js/surface/character.js:18`  `if (typeof listenFn === "function") {`
- `ui/js/surface/character.js:33`  `if (typeof emitFn === "function") {`
- `ui/js/surface/character.js:43`  `if (tauriWindow && typeof tauriWindow.startDragging === "function") {`
