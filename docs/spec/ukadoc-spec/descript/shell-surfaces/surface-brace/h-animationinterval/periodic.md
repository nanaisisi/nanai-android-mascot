# periodic,数値

- **規格**: [periodic.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell-surfaces/surface-brace/h-animationinterval/periodic/) (ukadoc-spec/descript/shell-surfaces/surface-brace/h-animationinterval/periodic.md)
- **検索語**: periodic
- **対応状況**: ⚠️ 一部対応


## 実装箇所

- `crates/nanai-surface/src/types/draw/interval.rs:68` `"periodic" => {`
- `crates/nanai-surface/src/types/draw/interval.rs:103` `"periodic" => Self::Periodic(param.and_then(|p| p.parse().ok()).unwrap_or(1000))`
- `crates/nanai-surface/src/types/draw/tests.rs:25` `Interval::parse("bind+periodic,500"),`
- `crates/nanai-surface/src/types/draw/tests.rs:35` `assert_eq!(Interval::parse("periodic,1000"), Interval::Periodic(1000));`
- `crates/nanai-surface/src/types/draw/tests.rs:36` `assert_eq!(Interval::parse("periodic,0"), Interval::Periodic(0));`
