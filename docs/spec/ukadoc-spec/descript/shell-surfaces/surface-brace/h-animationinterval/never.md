# never

- **規格**: [never.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell-surfaces/surface-brace/h-animationinterval/never/) (ukadoc-spec/descript/shell-surfaces/surface-brace/h-animationinterval/never.md)
- **検索語**: never
- **対応状況**: ✅ 実装済


## 実装箇所

- `crates/ui/src/surfaces/types/draw.rs:67` `assert_eq!(Interval::parse("never"), Interval::Never);`
- `crates/ui/src/surfaces/types/draw.rs:232` `/// `never`：自動発火しない（SHIORI からの強制実行用）`
- `crates/ui/src/surfaces/types/draw.rs:262` `"never" => Self::Never,`
- `crates/ui/src/animation/tests.rs:69` `for v in ["never", "bind", "talk", "starttalk", "endtalk", r"\e"] {`
- `ui/js/surface/surface-load.js:41` `// [never]`
