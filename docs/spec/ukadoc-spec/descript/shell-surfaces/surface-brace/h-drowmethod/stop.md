# stop,ID

- **規格**: [stop.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell-surfaces/surface-brace/h-animationinterval/stop/) (ukadoc-spec/descript/shell-surfaces/surface-brace/h-animationinterval/stop.md)
- **検索語**: stop
- **対応状況**: ⚠️ 一部対応


## 実装箇所

- `crates/ui/src/surfaces/parser/handlers/animation.rs:86` `|| first == "stop"`
- `crates/ui/src/surfaces/tests/interval_draw_tests.rs:79` `assert_eq!(DrawMethod::parse("stop"), DrawMethod::Stop(None));`
- `crates/ui/src/surfaces/tests/interval_draw_tests.rs:80` `assert_eq!(DrawMethod::parse("stop,2"), DrawMethod::Stop(Some(2)));`
- `crates/ui/src/surfaces/tests/parser_tests/parser_edge_cases.rs:123` `animation1.pattern1,stop,100,50`
- `crates/ui/src/surfaces/types/draw/method.rs:80` `s if s.starts_with("stop") => {`
