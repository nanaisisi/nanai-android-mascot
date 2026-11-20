# blend-add

- **規格**: [blend-add.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell-surfaces/surface-brace/h-animationinterval/blend-add/) (ukadoc-spec/descript/shell-surfaces/surface-brace/h-animationinterval/blend-add.md)
- **検索語**: blend-add
- **対応状況**: ✅ 実装済


## 実装箇所

- `ui/ts/surface/surface-compositor.ts:40` `"blend-add": "lighter",`
- `tests/surface-compositor.test.ts:12` `expect(resolveCompositeOperation("blend-add")).toBe("lighter");`
- `ui/ts/surface/surface-compositor.ts:41` `"blend-add-fast": "lighter",`
- `tests/surface-compositor.test.ts:13` `expect(resolveCompositeOperation("blend-add-fast")).toBe("lighter");`
