# type,種別

- **規格**: [type.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/) (ukadoc-spec/descript/balloon/descript-txt/type.md)
- **検索語**: type
- **対応状況**: ❌ 未実装(誤検出)

## 突合結果

ヒットしたのは一般的な語「type」の無関係な出現。該当の仕様に対応する処理は確認できない。

## 実装箇所

- `src-tauri/src/lib.rs:1` `use specta_typescript::Typescript;`
- `src-tauri/src/lib.rs:110` `commands::shiori::send_shiori_event_typed,`
- `src-tauri/src/commands/window/menu_window.rs:108` `menu_type: String,`
- `src-tauri/src/commands/window/menu_window.rs:172` `let _ = app_handle.emit("set-submenu-type", serde_json::json!({ "type": menu_typ`
- `src-tauri/src/commands/shiori/protocol.rs:129` `pub async fn send_shiori_event_typed(`
