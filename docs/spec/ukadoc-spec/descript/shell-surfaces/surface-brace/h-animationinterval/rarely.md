# rarely

- **規格**: [rarely.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell-surfaces/surface-brace/h-animationinterval/rarely/) (ukadoc-spec/descript/shell-surfaces/surface-brace/h-animationinterval/rarely.md)
- **検索語**: rarely
- **対応状況**: ✅ 実装済

## 突合結果

surface-animation-manager.js で interval 種別として処理している。

## 実装箇所

- `crates/ui/src/animation.rs:83` `/// 乱数周期系（sometimes / rarely / random,N）の1秒あたり発火確率`
- `crates/ui/src/animation.rs:85` `/// ukadoc 標準: sometimes 約10秒に1回 / rarely 約30秒に1回 / random,N 約N秒に1回`
- `crates/ui/src/animation.rs:218` `assert!((Interval::parse("rarely").fire_per_second().unwrap() - 1f64 / 30f64).ab`
- `crates/ui/src/surfaces/tests.rs:18` `assert_eq!(Interval::parse("rarely"), Interval::Rarely);`
- `crates/ui/src/surfaces/types/draw.rs:53` `/// `rarely`：まれに発火（より長い乱数周期）`
