# アンカー設定 (`anchor.*`)

- **対応状況**: ✅ 実装済

`anchor`, `anchor.visited`, `anchor.notselect` などのカラー、フォント、影、境界線スタイル適用。


## 実装箇所

- `src-tauri/src/commands/window/menu_window.rs:41` `let anchor_height = 40.0;`
- `src-tauri/src/commands/window/menu_window.rs:42` `target_y = (target_y - win_height + anchor_height).max(screen_pos.y as f64);`
- `crates/ui/src/lib.rs:81` `let script = r"\0\_q\x\_a[anchor01]リンク\_a\![raise,OnTest,1,2]\![bind,clothing,ri`
- `crates/ui/src/lib.rs:91` `id: "anchor01".into(),`
- `crates/ui/src/script/parser/brackets/mod.rs:104` `let mut chars = "a[anchor1]text\\_a".chars().peekable();`
