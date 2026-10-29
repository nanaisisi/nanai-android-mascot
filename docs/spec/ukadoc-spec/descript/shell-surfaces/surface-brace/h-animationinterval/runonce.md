# runonce

- **規格**: [runonce.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell-surfaces/surface-brace/h-animationinterval/runonce/) (ukadoc-spec/descript/shell-surfaces/surface-brace/h-animationinterval/runonce.md)
- **検索語**: runonce
- **対応状況**: ✅ 実装済

## 突合結果

surface-animation-manager.js で interval 種別として処理している。

## 実装箇所

- `crates/ui/src/animation.rs:124` `/// - `always`/`runonce`/`periodic,N`: 周期到来で発火 (`elapsed >= n` 又は即時)`
- `crates/ui/src/animation.rs:140` `// always / runonce は周期に応じて発火`
- `crates/ui/src/animation.rs:231` `// runonce / always は発火する`
- `crates/ui/src/animation.rs:232` `assert!(Interval::parse("runonce").should_fire(0, 0.0));`
- `crates/ui/src/surfaces/tests.rs:20` `assert_eq!(Interval::parse("runonce"), Interval::RunOnce);`
