# overlay-fast

- **規格**: [overlay-fast.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell-surfaces/surface-brace/h-animationinterval/overlay-fast/) (ukadoc-spec/descript/shell-surfaces/surface-brace/h-animationinterval/overlay-fast.md)
- **検索語**: overlay-fast
- **対応状況**: ✅ 実装済


## 実装箇所

- `crates/nanai-surface/src/types/draw/method.rs:62` `"overlayfast" | "fast" | "overlay-fast" => Self::OverlayFast,`
- `ui/ts/surface/surface-compositor.ts:49` `"blend-overlay-fast": "overlay",`
- `tests/surface-compositor.test.ts:19` `expect(resolveCompositeOperation("blend-overlay-fast")).toBe("overlay");`
- `crates/nanai-surface/src/types/draw/tests.rs:128` `assert_eq!(DrawMethod::parse("overlay-fast"), DrawMethod::OverlayFast);`
- `tests/surface-compositor.test.ts:70` `type: "blend-overlay-fast",`
