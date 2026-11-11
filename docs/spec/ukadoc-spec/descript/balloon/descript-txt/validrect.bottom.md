# validrect.bottom,座標

- **規格**: [validrect.bottom.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/) (ukadoc-spec/descript/balloon/descript-txt/validrect.bottom.md)
- **検索語**: validrect.bottom
- **対応状況**: ✅ 実装済

## 突合結果

`ui/js/core/actions/balloon-descript/layout.js` の `applyLayoutProperties()` において `validrect.bottom` をパースし、バルーン DOM (`.balloon`) の `padding-bottom` へ反映する実装が行われている。

## 実装箇所

- `crates/ui/src/descript/tests.rs:63` `validrect.bottom,600\n\`
- `crates/ui/src/descript/parser/queries.rs:41` `let b = self.get("validrect.bottom").and_then(|v| v.parse().ok());`
- `ui/ts/core/actions/balloon-theme-dom.ts:35` `const vb = parseInt(props["validrect.bottom"], 10);`
- `ui/ts/core/actions/balloon-descript/layout/rect.ts:7` `// [validrect.left,座標], [validrect.top,座標], [validrect.right,座標], [validrect.bot`
- `ui/ts/core/actions/balloon-descript/layout/rect.ts:11` `const vb = parseInt(props["validrect.bottom"], 10);`
