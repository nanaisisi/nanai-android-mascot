# char\*.defaultx,X座標

- **規格**: [char-star-.defaultx.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell/descript-txt/char-star-.defaultx/) (ukadoc-spec/descript/shell/descript-txt/char-star-.defaultx.md)
- **検索語**: char
- **対応状況**: ✅ 実装済 (Rust `crates/ui/src/descript.rs` Descript 解析 / `crates/ui/src/shell.rs` Shell::load)

## 突合結果

ヒットしたのは一般的な語「char」の無関係な出現。該当の仕様に対応する処理は確認できない。

## 実装箇所

- `src-tauri/src/lib.rs:131` `commands::window::show_subchar_window,`
- `src-tauri/src/lib.rs:132` `commands::window::hide_subchar_window,`
- `src-tauri/src/lib.rs:133` `commands::window::set_character_scale,`
- `src-tauri/src/lib.rs:138` `commands::window::sync_character_balloon,`
- `src-tauri/src/commands/window/character_window.rs:4` `pub async fn show_character_window(`
