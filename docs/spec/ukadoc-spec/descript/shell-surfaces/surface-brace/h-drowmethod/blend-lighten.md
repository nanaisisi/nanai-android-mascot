# blend-lighten

- **規格**: [blend-lighten.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell-surfaces/surface-brace/h-animationinterval/blend-lighten/) (ukadoc-spec/descript/shell-surfaces/surface-brace/h-animationinterval/blend-lighten.md)
- **検索語**: blend-lighten
- **対応状況**: ✅ 実装済


## 実装箇所

- `ui/ts/surface/surface-compositor.ts:52` `"blend-lighten": "lighten",`
- `tests/surface-compositor.test.ts:21` `expect(resolveCompositeOperation("blend-lighten-fast")).toBe("lighten");`
- `ui/ts/surface/surface-compositor.ts:53` `"blend-lighten-fast": "lighten",`
