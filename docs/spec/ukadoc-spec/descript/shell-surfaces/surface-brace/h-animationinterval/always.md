# always

- **規格**: [always.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell-surfaces/surface-brace/h-animationinterval/always/) (ukadoc-spec/descript/shell-surfaces/surface-brace/h-animationinterval/always.md)
- **検索語**: always
- **対応状況**: ⚠️ 一部対応


## 実装箇所

- `crates/ui/src/animation/tests/timeline.rs:64` `assert!(Interval::parse("always").should_fire(0, 0.0));`
- `crates/ui/src/surfaces/tests/collision_tests.rs:152` `animation10.interval,always`
- `crates/ui/src/surfaces/tests/interval_draw_tests.rs:27` `assert_eq!(Interval::parse("always"), Interval::Always);`
- `crates/ui/src/surfaces/tests/interval_draw_tests.rs:150` `assert_eq!(Interval::parse("  always  "), Interval::Always);`
- `crates/ui/src/surfaces/tests/parser_tests/parser_edge_cases.rs:117` `animationabc.interval,always`
