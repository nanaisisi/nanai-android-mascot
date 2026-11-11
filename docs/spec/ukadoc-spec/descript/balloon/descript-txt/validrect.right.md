# validrect.right,座標

- **規格**: [validrect.right.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/) (ukadoc-spec/descript/balloon/descript-txt/validrect.right.md)
- **検索語**: validrect.right
- **対応状況**: ✅ 実装済

## 突合結果

`ui/js/core/actions/balloon-descript/layout.js` の `applyLayoutProperties()` において `validrect.right` をパースし、バルーン DOM (`.balloon`) の `padding-right` へ反映する実装が行われている。

## 実装箇所

- `crates/ui/src/descript/tests.rs:62` `validrect.right,800\n\`
- `crates/ui/src/descript/parser/queries.rs:40` `let r = self.get("validrect.right").and_then(|v| v.parse().ok());`
- `ui/ts/core/actions/balloon-theme-dom.ts:34` `const vr = parseInt(props["validrect.right"], 10);`
- `ui/ts/core/actions/balloon-descript/layout/rect.ts:7` `// [validrect.left,座標], [validrect.top,座標], [validrect.right,座標], [validrect.bot`
- `ui/ts/core/actions/balloon-descript/layout/rect.ts:10` `const vr = parseInt(props["validrect.right"], 10);`
