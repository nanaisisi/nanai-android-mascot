# yen-e

- **規格**: [yen-e.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell-surfaces/surface-brace/h-animationinterval/yen-e/) (ukadoc-spec/descript/shell-surfaces/surface-brace/h-animationinterval/yen-e.md)
- **検索語**: yen-e
- **対応状況**: ❌ 検出なし

## 突合結果

実装コード内に「yen-e」を確認。


## 実装箇所

- `crates/ui/src/surfaces/types/draw.rs:71` `/// `\e`（yen-e）：さくらスクリプト `\e` 到達時に強制実行`
- `ui/js/surface/animation-parser.js:88` `.map((kind) => (kind === "\\e" || kind === "/e" ? "yen-e" : kind))`
- `ui/js/surface/surface-animation-manager.js:79` `!kinds.has("yen-e") &&`
- `ui/js/surface/surface-animation-manager.js:269` `this.triggerAnimations(scopeId, "yen-e");`
- `ui/js/surface/shell-manifest.js:29` `/** interval 文字列化（\e は yen-e とみなす） */`
