# runonce

- **規格**: [runonce.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell-surfaces/surface-brace/h-animationinterval/runonce/) (ukadoc-spec/descript/shell-surfaces/surface-brace/h-animationinterval/runonce.md)
- **検索語**: runonce
- **対応状況**: ⚠️ 一部対応


## 実装箇所

- `crates/nanai-surface/src/types/draw/interval.rs:83` `"runonce" => return Self::RunOnce,`
- `crates/nanai-surface/src/types/draw/interval.rs:96` `"runonce" => Self::RunOnce,`
- `crates/nanai-surface/src/types/draw/tests.rs:9` `assert_eq!(Interval::parse("runonce"), Interval::RunOnce);`
- `crates/nanai-surface/src/types/draw/tests.rs:78` `assert_eq!(Interval::parse("runonce,123"), Interval::RunOnce);`
- `crates/ui/src/animation/tests/timeline.rs:76` `assert!(Interval::parse("runonce").should_fire(0, 0.0));`
