# parallelstop,(ID1,ID2...)

- **規格**: [parallelstop.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell-surfaces/surface-brace/h-animationinterval/parallelstop/) (ukadoc-spec/descript/shell-surfaces/surface-brace/h-animationinterval/parallelstop.md)
- **検索語**: parallelstop
- **対応状況**: ⚠️ 一部対応


## 実装箇所

- `crates/nanai-surface/src/types/draw/method.rs:98` `s if s.starts_with("parallelstop") => {`
- `crates/nanai-surface/src/types/draw/method.rs:99` `let rest = s.trim_start_matches("parallelstop").trim();`
- `crates/nanai-surface/src/types/draw/tests.rs:166` `DrawMethod::parse("parallelstop,[3.4]"),`
