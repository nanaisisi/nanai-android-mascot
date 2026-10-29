# sometimes

- **規格**: [sometimes.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell-surfaces/surface-brace/h-animationinterval/sometimes/) (ukadoc-spec/descript/shell-surfaces/surface-brace/h-animationinterval/sometimes.md)
- **検索語**: sometimes
- **対応状況**: ✅ 実装済

## 突合結果

surface-animation-manager.js で interval 種別として処理している。

## 実装箇所

- `crates/ui/src/animation.rs:83` `/// 乱数周期系（sometimes / rarely / random,N）の1秒あたり発火確率`
- `crates/ui/src/animation.rs:85` `/// ukadoc 標準: sometimes 約10秒に1回 / rarely 約30秒に1回 / random,N 約N秒に1回`
- `crates/ui/src/animation.rs:217` `assert!((Interval::parse("sometimes").fire_per_second().unwrap() - 0.1).abs() < `
- `crates/ui/src/surfaces/tests.rs:17` `assert_eq!(Interval::parse("sometimes"), Interval::Sometimes);`
- `crates/ui/src/surfaces/tests.rs:381` `animation200.interval,sometimes`
