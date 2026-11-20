# rarely

- **規格**: [rarely.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell-surfaces/surface-brace/h-animationinterval/rarely/) (ukadoc-spec/descript/shell-surfaces/surface-brace/h-animationinterval/rarely.md)
- **検索語**: rarely
- **対応状況**: ⚠️ 一部対応


## 実装箇所

- `crates/nanai-core/src/seriko_animation.rs:41` `pub(crate) interval: String, // sometimes, rarely, always, runagain, bind, never`
- `crates/nanai-surface/src/types/draw/interval.rs:72` `"rarely" => return Self::Rarely,`
- `crates/nanai-surface/src/types/draw/interval.rs:94` `"rarely" => Self::Rarely,`
- `crates/nanai-surface/src/types/draw/tests.rs:7` `assert_eq!(Interval::parse("rarely"), Interval::Rarely);`
- `crates/nanai-surface/src/types/draw/tests.rs:21` `assert_eq!(Interval::parse("bind+rarely"), Interval::Rarely);`
