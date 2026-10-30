# char\*.defaulttop,Y座標

- **規格**: [char-star-.defaulttop.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell/descript-txt/char-star-.defaulttop/) (ukadoc-spec/descript/shell/descript-txt/char-star-.defaulttop.md)
- **検索語**: char
- **対応状況**: ✅ 実装済 (Rust `crates/ui/src/descript.rs` Descript 解析 / `crates/ui/src/shell.rs` Shell::load)

## 突合結果

ヒットしたのは一般的な語「char」の無関係な出現。該当の仕様に対応する処理は確認できない。

## 実装箇所

- `src-tauri/src/lib.rs:133` `commands::window::show_subchar_window,`
- `src-tauri/src/lib.rs:134` `commands::window::hide_subchar_window,`
- `src-tauri/src/lib.rs:135` `commands::window::set_character_scale,`
- `src-tauri/src/lib.rs:140` `commands::window::sync_character_balloon,`
- `src-tauri/src/commands/ext.rs:41` `// [readme,ファイル名], [readme.charset,文字コード], [charset,文字コード], [secondchangeinterva`
