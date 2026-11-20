# interpolate

- **規格**: [interpolate.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell-surfaces/surface-brace/h-animationinterval/interpolate/) (ukadoc-spec/descript/shell-surfaces/surface-brace/h-animationinterval/interpolate.md)
- **検索語**: interpolate
- **対応状況**: ⚠️ 一部対応


## 実装箇所

- `crates/nanai-surface/src/types/draw/method.rs:63` `"interpolate" => Self::Interpolate,`
- `src-tauri/src/commands/shell/manifest.rs:117` `DrawMethod::Interpolate => "interpolate".to_string(),`
- `crates/nanai-surface/src/types/draw/tests.rs:129` `assert_eq!(DrawMethod::parse("interpolate"), DrawMethod::Interpolate);`
