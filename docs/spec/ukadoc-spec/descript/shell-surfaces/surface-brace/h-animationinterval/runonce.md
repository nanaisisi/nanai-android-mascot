# runonce

- **規格**: [runonce.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell-surfaces/surface-brace/h-animationinterval/runonce/) (ukadoc-spec/descript/shell-surfaces/surface-brace/h-animationinterval/runonce.md)
- **検索語**: runonce
- **対応状況**: ✅ 実装済


## 実装箇所

- `crates/ui/src/surfaces/types/draw.rs:68` `assert_eq!(Interval::parse("runonce"), Interval::RunOnce);`
- `crates/ui/src/surfaces/types/draw.rs:124` `assert_eq!(Interval::parse("runonce,123"), Interval::RunOnce);`
- `crates/ui/src/surfaces/types/draw.rs:230` `/// `runonce`：サーフィス切替時に必ず1回だけ実行`
- `crates/ui/src/surfaces/types/draw.rs:263` `"runonce" => Self::RunOnce,`
- `crates/ui/src/animation/tests.rs:73` `assert!(Interval::parse("runonce").should_fire(0, 0.0));`
