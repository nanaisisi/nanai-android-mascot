# alternativestart,(ID1,ID2...)

- **規格**: [alternativestart.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell-surfaces/surface-brace/h-animationinterval/alternativestart/) (ukadoc-spec/descript/shell-surfaces/surface-brace/h-animationinterval/alternativestart.md)
- **検索語**: alternativestart
- **対応状況**: ⚠️ 一部対応


## 実装箇所

- `crates/nanai-core/src/surfaces_parser/parser/animations.rs:119` `"start" | "stop" | "alternativestart" | "parallelstart"`
- `crates/nanai-surface/src/types/draw/method.rs:86` `s if s.starts_with("alternativestart") => {`
- `crates/nanai-surface/src/types/draw/method.rs:87` `let rest = s.trim_start_matches("alternativestart").trim();`
- `crates/nanai-surface/src/types/draw/tests.rs:154` `DrawMethod::parse("alternativestart,(1,2)"),`
