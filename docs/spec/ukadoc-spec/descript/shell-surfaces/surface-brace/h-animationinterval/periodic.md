# periodic,数値

- **規格**: [periodic.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell-surfaces/surface-brace/h-animationinterval/periodic/) (ukadoc-spec/descript/shell-surfaces/surface-brace/h-animationinterval/periodic.md)
- **検索語**: periodic
- **対応状況**: ⚠️ 一部対応


## 実装箇所

- `crates/ui/src/animation/tests/active_animation.rs:146` `assert_eq!(Interval::parse("periodic,abc"), Interval::Periodic(1000));`
- `crates/ui/src/animation/tests/active_animation.rs:163` `let periodic = Interval::Periodic(1000);`
- `crates/ui/src/animation/tests/active_animation.rs:164` `assert!(!periodic.should_fire(500, 0.0));`
- `crates/ui/src/animation/tests/timeline.rs:54` `assert_eq!(Interval::parse("periodic,1000").periodic_ms(), Some(1000));`
- `crates/ui/src/animation/tests/timeline.rs:55` `assert!(Interval::parse("periodic,1000").should_fire(1_000, 0.99));`
