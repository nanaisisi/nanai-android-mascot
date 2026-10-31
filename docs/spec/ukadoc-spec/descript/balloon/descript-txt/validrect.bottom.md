# validrect.bottom,座標

- **規格**: [validrect.bottom.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/) (ukadoc-spec/descript/balloon/descript-txt/validrect.bottom.md)
- **検索語**: validrect.bottom
- **対応状況**: ✅ 対応済

## 突合結果

`ui/js/core/actions/balloon-descript/layout.js` の `applyLayoutProperties()` において `validrect.bottom` をパースし、バルーン DOM (`.balloon`) の `padding-bottom` へ反映する実装が行われている。

## 実装箇所

- `crates/ui/src/descript/parser.rs:82` `let b = self.get("validrect.bottom").and_then(|v| v.parse().ok());`
- `crates/ui/src/descript/tests.rs:63` `validrect.bottom,600\n\`
- `ui/js/core/actions/balloon-descript/layout.js:83` `// [validrect.left,座標], [validrect.top,座標], [validrect.right,座標], [validrect.bot`
- `ui/js/core/actions/balloon-descript/layout.js:87` `const vb = parseInt(props["validrect.bottom"], 10);`
- `ui/js/ghost/balloon-window.js:86` `const vb = parseInt(props["validrect.bottom"], 10);`
