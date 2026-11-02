# interpolate

- **規格**: [interpolate.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell-surfaces/surface-brace/h-animationinterval/interpolate/) (ukadoc-spec/descript/shell-surfaces/surface-brace/h-animationinterval/interpolate.md)
- **検索語**: interpolate
- **対応状況**: ✅ 実装済


## 実装箇所

- `src-tauri/src/commands/shell/manifest.rs:118` `DrawMethod::Interpolate => "interpolate".to_string(),`
- `crates/ui/src/surfaces/types/draw.rs:14` `/// `interpolate`：下の絵と同一色の部分を透過して重ねる`
- `crates/ui/src/surfaces/types/draw.rs:44` `"interpolate" => Self::Interpolate,`
- `crates/ui/src/surfaces/types/draw.rs:175` `assert_eq!(DrawMethod::parse("interpolate"), DrawMethod::Interpolate);`
- `ui/js/surface/surface-load.js:115` `// [interpolate]`
