# blend-color

- **規格**: [blend-color.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell-surfaces/surface-brace/h-animationinterval/blend-color/) (ukadoc-spec/descript/shell-surfaces/surface-brace/h-animationinterval/blend-color.md)
- **検索語**: blend-color
- **対応状況**: ✅ 実装済


## 実装箇所

- `ui/ts/surface/surface-compositor.ts:54` `"blend-color-dodge": "color-dodge",`
- `tests/surface-compositor.test.ts:22` `expect(resolveCompositeOperation("blend-color-dodge-fast")).toBe(`
- `ui/ts/surface/surface-compositor.ts:55` `"blend-color-dodge-fast": "color-dodge",`
- `tests/surface-compositor.test.ts:25` `expect(resolveCompositeOperation("blend-color-burn-fast")).toBe(`
- `ui/ts/surface/surface-compositor.ts:56` `"blend-color-burn": "color-burn",`
- `tests/surface-compositor.test.ts:42` `expect(resolveCompositeOperation("blend-color-fast")).toBe("color");`
