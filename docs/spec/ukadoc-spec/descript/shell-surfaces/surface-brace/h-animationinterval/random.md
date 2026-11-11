# random,数値

- **規格**: [random.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell-surfaces/surface-brace/h-animationinterval/random/) (ukadoc-spec/descript/shell-surfaces/surface-brace/h-animationinterval/random.md)
- **検索語**: random
- **対応状況**: ⚠️ 一部対応


## 実装箇所

- `crates/ui/src/animation/tests/active_animation.rs:10` `assert_eq!(Interval::parse("random,0").fire_per_second(), Some(1.0));`
- `crates/ui/src/animation/tests/active_animation.rs:145` `assert_eq!(Interval::parse("random,abc"), Interval::Random(10));`
- `crates/ui/src/animation/tests/active_animation.rs:166` `let random = Interval::Random(5);`
- `crates/ui/src/animation/tests/active_animation.rs:167` `assert!(!random.should_fire(100, 0.99));`
- `crates/ui/src/animation/tests/timeline.rs:50` `assert_eq!(Interval::parse("random,5").fire_per_second(), Some(0.2));`
