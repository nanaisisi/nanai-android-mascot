# surface\*ブレスで可能なID指定

- **規格**: [caption_surfacebraceid.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell-surfaces/surface-brace/caption_surfacebraceid/) (ukadoc-spec/descript/shell-surfaces/surface-brace/caption_surfacebraceid.md)
- **検索語**: surface
- **対応状況**: ❌ 未実装

## 突合結果

surface-parser.js / surface-animation-manager.js に該当の解析・処理は確認できない。

## 実装箇所

- `src-tauri/src/fmo.rs:11` `pub surface0: u32,`
- `src-tauri/src/fmo.rs:12` `pub surface1: u32,`
- `src-tauri/src/fmo.rs:41` `surface0: 0,`
- `src-tauri/src/fmo.rs:42` `surface1: 10,`
- `src-tauri/src/lib.rs:97` `commands::shell::parse_surfaces_text,`
