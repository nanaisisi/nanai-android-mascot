# type,種別

- **規格**: [type.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell/descript-txt/type/) (ukadoc-spec/descript/shell/descript-txt/type.md)
- **検索語**: type
- **対応状況**: ✅ 実装済 (Rust `crates/ui/src/descript.rs` Descript 解析 / `crates/ui/src/shell.rs` Shell::load)

## 突合結果

ヒットしたのは一般的な語「type」の無関係な出現。該当の仕様に対応する処理は確認できない。

## 実装箇所
- `crates/ui/src/descript.rs` （Rust 版 descript.txt パーサー: bindgroup / bindoption / default* / type / craftmanurl 解析）

- `src-tauri/src/commands/window/menu_window.rs:97`  `menu_type: String,`
- `src-tauri/src/commands/window/menu_window.rs:158`  `let _ = app_handle.emit("set-submenu-type", serde_json::json!({ "type": menu_type }));`
- `ui/js/surface/character.js:18`  `if (typeof listenFn === "function") {`
- `ui/js/surface/character.js:33`  `if (typeof emitFn === "function") {`
- `ui/js/surface/character.js:43`  `if (tauriWindow && typeof tauriWindow.startDragging === "function") {`
