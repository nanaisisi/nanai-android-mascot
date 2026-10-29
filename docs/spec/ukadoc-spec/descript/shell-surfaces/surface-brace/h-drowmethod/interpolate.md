# interpolate

- **規格**: [interpolate.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell-surfaces/surface-brace/h-drowmethod/interpolate/) (ukadoc-spec/descript/shell-surfaces/surface-brace/h-drowmethod/interpolate.md)
- **検索語**: interpolate
- **対応状況**: ❌ 検出なし

## 突合結果

実装コード内に「interpolate」を確認。


## 実装箇所

- `src-tauri/src/commands/shell/manifest.rs:118` `DrawMethod::Interpolate => "interpolate".to_string(),`
- `crates/ui/src/surfaces/tests.rs:46` `assert_eq!(DrawMethod::parse("interpolate"), DrawMethod::Interpolate);`
- `crates/ui/src/surfaces/types/draw.rs:14` `/// `interpolate`：下の絵と同一色の部分を透過して重ねる`
- `crates/ui/src/surfaces/types/draw.rs:36` `"interpolate" => Self::Interpolate,`
