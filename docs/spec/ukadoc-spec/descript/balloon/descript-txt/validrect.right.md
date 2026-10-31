# validrect.right,座標

- **規格**: [validrect.right.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/) (ukadoc-spec/descript/balloon/descript-txt/validrect.right.md)
- **検索語**: validrect.right
- **対応状況**: ✅ 対応済

## 突合結果

`ui/js/core/actions/balloon-descript/layout.js` の `applyLayoutProperties()` において `validrect.right` をパースし、バルーン DOM (`.balloon`) の `padding-right` へ反映する実装が行われている。

## 実装箇所

- `crates/ui/src/descript/parser.rs:81` `let r = self.get("validrect.right").and_then(|v| v.parse().ok());`
- `crates/ui/src/descript/tests.rs:62` `validrect.right,800\n\`
- `ui/js/core/actions/balloon-descript/layout.js:83` `// [validrect.left,座標], [validrect.top,座標], [validrect.right,座標], [validrect.bot`
- `ui/js/core/actions/balloon-descript/layout.js:86` `const vr = parseInt(props["validrect.right"], 10);`
- `ui/js/ghost/balloon-window.js:85` `const vr = parseInt(props["validrect.right"], 10);`
