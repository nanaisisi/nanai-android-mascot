# never

- **規格**: [never.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell-surfaces/surface-brace/h-animationinterval/never/) (ukadoc-spec/descript/shell-surfaces/surface-brace/h-animationinterval/never.md)
- **検索語**: never
- **対応状況**: ⚠️ 一部対応


## 実装箇所

- `crates/ui/src/animation/tests/timeline.rs:59` `for v in ["never", "bind", "talk", "starttalk", "endtalk", r"\e"] {`
- `crates/ui/src/surfaces/tests/interval_draw_tests.rs:30` `assert_eq!(Interval::parse("never"), Interval::Never);`
- `crates/ui/src/surfaces/types/draw/interval.rs:84` `"never" => return Self::Never,`
- `crates/ui/src/surfaces/types/draw/interval.rs:95` `"never" => Self::Never,`
- `crates/ui/src/surfaces/types/draw/tests.rs:8` `assert_eq!(Interval::parse("never"), Interval::Never);`
