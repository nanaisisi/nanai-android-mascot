# overlay-fast

- **規格**: [overlay-fast.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell-surfaces/surface-brace/h-animationinterval/overlay-fast/) (ukadoc-spec/descript/shell-surfaces/surface-brace/h-animationinterval/overlay-fast.md)
- **検索語**: overlay-fast
- **対応状況**: ✅ 実装済


## 実装箇所

- `crates/ui/src/surfaces/types/draw.rs:43` `"overlayfast" | "fast" | "overlay-fast" => Self::OverlayFast,`
- `crates/ui/src/surfaces/types/draw.rs:174` `assert_eq!(DrawMethod::parse("overlay-fast"), DrawMethod::OverlayFast);`
- `ui/js/surface/surface-load.js:99` `// [blend-overlay-fast]`
- `ui/js/surface/surface-load.js:118` `// [overlay-fast]`
