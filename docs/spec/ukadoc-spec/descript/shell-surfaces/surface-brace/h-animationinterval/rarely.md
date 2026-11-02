# rarely

- **規格**: [rarely.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell-surfaces/surface-brace/h-animationinterval/rarely/) (ukadoc-spec/descript/shell-surfaces/surface-brace/h-animationinterval/rarely.md)
- **検索語**: rarely
- **対応状況**: ✅ 実装済


## 実装箇所

- `crates/ui/src/surfaces/types/draw.rs:66` `assert_eq!(Interval::parse("rarely"), Interval::Rarely);`
- `crates/ui/src/surfaces/types/draw.rs:224` `/// `rarely`：まれに発火（より長い乱数周期）`
- `crates/ui/src/surfaces/types/draw.rs:261` `"rarely" => Self::Rarely,`
- `crates/ui/src/animation/timeline.rs:74` `/// 乱数周期系（sometimes / rarely / random,N）の1秒あたり発火確率`
- `crates/ui/src/animation/tests.rs:62` `assert!((Interval::parse("rarely").fire_per_second().unwrap() - 1f64 / 30f64).ab`
