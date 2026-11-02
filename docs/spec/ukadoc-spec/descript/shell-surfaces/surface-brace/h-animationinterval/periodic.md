# periodic,数値

- **規格**: [periodic.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell-surfaces/surface-brace/h-animationinterval/periodic/) (ukadoc-spec/descript/shell-surfaces/surface-brace/h-animationinterval/periodic.md)
- **検索語**: periodic
- **対応状況**: ✅ 実装済


## 実装箇所

- `crates/ui/src/surfaces/types/draw.rs:78` `fn test_interval_parse_parametric_random_and_periodic() {`
- `crates/ui/src/surfaces/types/draw.rs:81` `assert_eq!(Interval::parse("periodic,1000"), Interval::Periodic(1000));`
- `crates/ui/src/surfaces/types/draw.rs:82` `assert_eq!(Interval::parse("periodic,0"), Interval::Periodic(0));`
- `crates/ui/src/surfaces/types/draw.rs:86` `assert_eq!(Interval::parse("periodic , 500 "), Interval::Periodic(500));`
- `crates/ui/src/surfaces/types/draw.rs:95` `assert_eq!(Interval::parse("periodic"), Interval::Periodic(1000));`
