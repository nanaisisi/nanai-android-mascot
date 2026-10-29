# never

- **規格**: [never.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell-surfaces/surface-brace/h-animationinterval/never/) (ukadoc-spec/descript/shell-surfaces/surface-brace/h-animationinterval/never.md)
- **検索語**: never
- **対応状況**: ✅ 実装済

## 突合結果

surface-animation-manager.js で interval 種別として処理している。

## 実装箇所

- `crates/ui/src/animation.rs:227` `for v in ["never", "bind", "talk", "starttalk", "endtalk", r"\e"] {`
- `crates/ui/src/surfaces/tests.rs:19` `assert_eq!(Interval::parse("never"), Interval::Never);`
- `crates/ui/src/surfaces/types/draw.rs:61` `/// `never`：自動発火しない（SHIORI からの強制実行用）`
- `crates/ui/src/surfaces/types/draw.rs:91` `"never" => Self::Never,`
- `ui/js/surface/shell-manifest.js:164` `interval: intervalToString(anim.interval) || "never",`
