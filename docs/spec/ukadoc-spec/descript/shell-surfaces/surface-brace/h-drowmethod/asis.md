# asis

- **規格**: [asis.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell-surfaces/surface-brace/h-animationinterval/asis/) (ukadoc-spec/descript/shell-surfaces/surface-brace/h-animationinterval/asis.md)
- **検索語**: asis
- **対応状況**: ⚠️ 一部対応


## 実装箇所

- `crates/nanai-surface/src/types/draw/method.rs:67` `"asis" => Self::AsIs,`
- `src-tauri/src/commands/shell/manifest.rs:120` `DrawMethod::AsIs => "asis".to_string(),`
- `crates/nanai-surface/src/types/draw/tests.rs:133` `assert_eq!(DrawMethod::parse("asis"), DrawMethod::AsIs);`
