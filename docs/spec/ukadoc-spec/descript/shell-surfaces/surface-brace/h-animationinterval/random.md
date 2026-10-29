# random,数値

- **規格**: [random.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell-surfaces/surface-brace/h-animationinterval/random/) (ukadoc-spec/descript/shell-surfaces/surface-brace/h-animationinterval/random.md)
- **検索語**: random
- **対応状況**: ✅ 実装済

## 突合結果

surface-animation-manager.js で interval 種別として処理している。

## 実装箇所

- `crates/ui/src/animation.rs:83` `/// 乱数周期系（sometimes / rarely / random,N）の1秒あたり発火確率`
- `crates/ui/src/animation.rs:85` `/// ukadoc 標準: sometimes 約10秒に1回 / rarely 約30秒に1回 / random,N 約N秒に1回`
- `crates/ui/src/animation.rs:216` `assert_eq!(Interval::parse("random,5").fire_per_second(), Some(0.2));`
- `crates/ui/src/animation.rs:235` `// random は確率内の乱数で発火・確率外では非発火`
- `crates/ui/src/animation.rs:236` `let random5 = Interval::parse("random,5");`
