# asis

- **規格**: [asis.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell-surfaces/surface-brace/h-animationinterval/asis/) (ukadoc-spec/descript/shell-surfaces/surface-brace/h-animationinterval/asis.md)
- **検索語**: asis
- **対応状況**: ✅ 実装済


## 実装箇所

- `src-tauri/build_old.rs:53` `"basis.cpp",`
- `src-tauri/src/commands/shell/manifest.rs:121` `DrawMethod::AsIs => "asis".to_string(),`
- `crates/ui/src/surfaces/types/draw.rs:22` `/// `asis`：透過処理を行わずそのまま描画`
- `crates/ui/src/surfaces/types/draw.rs:48` `"asis" => Self::AsIs,`
- `crates/ui/src/surfaces/types/draw.rs:179` `assert_eq!(DrawMethod::parse("asis"), DrawMethod::AsIs);`
