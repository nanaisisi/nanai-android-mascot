# overlay-fast

- **規格**: [overlay-fast.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell-surfaces/surface-brace/h-animationinterval/overlay-fast/) (ukadoc-spec/descript/shell-surfaces/surface-brace/h-animationinterval/overlay-fast.md)
- **検索語**: overlay-fast
- **対応状況**: ⚠️ 一部対応


## 実装箇所

- `crates/nanai-surface/src/types/draw/method.rs:62` `"overlayfast" | "fast" | "overlay-fast" => Self::OverlayFast,`
- `crates/nanai-surface/src/types/draw/tests.rs:128` `assert_eq!(DrawMethod::parse("overlay-fast"), DrawMethod::OverlayFast);`
