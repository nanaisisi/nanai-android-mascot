# validrect.top,座標

- **規格**: [validrect.top.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/) (ukadoc-spec/descript/balloon/descript-txt/validrect.top.md)
- **検索語**: validrect.top
- **対応状況**: ✅ 実装済

## 突合結果

`ui/js/core/actions/balloon-descript/layout.js` の `applyLayoutProperties()` において `validrect.top` をパースし、バルーン DOM (`.balloon`) の `padding-top` へ反映する実装が行われている。

## 実装箇所

- `crates/ui/src/descript/tests.rs:61` `validrect.top,0\n\`
- `crates/ui/src/descript/parser/queries.rs:39` `let t = self.get("validrect.top").and_then(|v| v.parse().ok());`
- `ui/ts/core/actions/balloon-theme-dom.ts:33` `const vt = parseInt(props["validrect.top"], 10);`
- `ui/ts/core/actions/balloon-descript/layout/rect.ts:7` `// [validrect.left,座標], [validrect.top,座標], [validrect.right,座標], [validrect.bot`
- `ui/ts/core/actions/balloon-descript/layout/rect.ts:9` `const vt = parseInt(props["validrect.top"], 10);`
