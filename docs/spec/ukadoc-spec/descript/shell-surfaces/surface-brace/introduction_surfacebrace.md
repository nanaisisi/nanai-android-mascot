# surfaceブレス記述例

- **規格**: [introduction_surfacebrace.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell-surfaces/surface-brace/introduction_surfacebrace/) (ukadoc-spec/descript/shell-surfaces/surface-brace/introduction_surfacebrace.md)
- **検索語**: surface
- **対応状況**: ✅ 実装済

## 突合結果

surface-parser.js / surface-animation-manager.js に該当の解析・処理は確認できない。

## 実装箇所

- `src-tauri/src/fmo.rs:11` `pub surface0: u32,`
- `src-tauri/src/fmo.rs:12` `pub surface1: u32,`
- `src-tauri/src/fmo.rs:39` `surface0: 0,`
- `src-tauri/src/fmo.rs:40` `surface1: 10,`
- `src-tauri/src/lib.rs:99` `commands::shell::parse_surfaces_text,`
