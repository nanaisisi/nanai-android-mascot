# blend-overlay

- **規格**: [blend-overlay.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell-surfaces/surface-brace/h-animationinterval/blend-overlay/) (ukadoc-spec/descript/shell-surfaces/surface-brace/h-animationinterval/blend-overlay.md)
- **検索語**: blend-overlay
- **対応状況**: ✅ 実装済


## 実装箇所

- `ui/ts/surface/surface-compositor.ts:48` `"blend-overlay": "overlay",`
- `tests/surface-compositor.test.ts:18` `expect(resolveCompositeOperation("blend-overlay")).toBe("overlay");`
- `ui/ts/surface/surface-compositor.ts:49` `"blend-overlay-fast": "overlay",`
- `tests/surface-compositor.test.ts:19` `expect(resolveCompositeOperation("blend-overlay-fast")).toBe("overlay");`
- `tests/surface-compositor.test.ts:70` `type: "blend-overlay-fast",`
