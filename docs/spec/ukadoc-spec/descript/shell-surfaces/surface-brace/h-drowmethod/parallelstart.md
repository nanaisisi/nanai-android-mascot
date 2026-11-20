# parallelstart,(ID1,ID2...)

- **規格**: [parallelstart.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell-surfaces/surface-brace/h-animationinterval/parallelstart/) (ukadoc-spec/descript/shell-surfaces/surface-brace/h-animationinterval/parallelstart.md)
- **検索語**: parallelstart
- **対応状況**: ⚠️ 一部対応


## 実装箇所

- `crates/nanai-core/src/surfaces_parser/parser/animations.rs:119` `"start" | "stop" | "alternativestart" | "parallelstart"`
- `crates/nanai-surface/src/types/draw/method.rs:94` `s if s.starts_with("parallelstart") => {`
- `crates/nanai-surface/src/types/draw/method.rs:95` `let rest = s.trim_start_matches("parallelstart").trim();`
- `crates/nanai-surface/src/types/draw/tests.rs:162` `DrawMethod::parse("parallelstart,(3,4)"),`
