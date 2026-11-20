# alternativestop,(ID1,ID2...)

- **規格**: [alternativestop.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell-surfaces/surface-brace/h-animationinterval/alternativestop/) (ukadoc-spec/descript/shell-surfaces/surface-brace/h-animationinterval/alternativestop.md)
- **検索語**: alternativestop
- **対応状況**: ⚠️ 一部対応


## 実装箇所

- `crates/nanai-surface/src/types/draw/method.rs:90` `s if s.starts_with("alternativestop") => {`
- `crates/nanai-surface/src/types/draw/method.rs:91` `let rest = s.trim_start_matches("alternativestop").trim();`
- `crates/nanai-surface/src/types/draw/tests.rs:158` `DrawMethod::parse("alternativestop,[1.2]"),`
