# yen-e

- **規格**: [yen-e.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell-surfaces/surface-brace/h-animationinterval/yen-e/) (ukadoc-spec/descript/shell-surfaces/surface-brace/h-animationinterval/yen-e.md)
- **検索語**: yen-e
- **対応状況**: ✅ 実装済


## 実装箇所

- `crates/ui/src/surfaces/types/draw.rs:242` `/// `\e`（yen-e）：さくらスクリプト `\e` 到達時に強制実行`
- `crates/ui/src/animation/scheduler.rs:518` `/// スクリプト終了 (\e, yen-e) トリガー`
- `crates/ui/src/animation/tests.rs:304` `// yen-e`
- `ui/js/surface/animation-parser.js:88` `.map((kind) => (kind === "\\e" || kind === "/e" ? "yen-e" : kind))`
- `ui/js/surface/surface-load.js:50` `// [yen-e]`
