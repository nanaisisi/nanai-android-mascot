# validrect.right,座標

- **規格**: [validrect.right.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/) (ukadoc-spec/descript/balloon/descript-txt/validrect.right.md)
- **検索語**: validrect.right
- **対応状況**: ✅ 対応済

## 突合結果

`ui/js/core/actions/balloon-descript/layout.js` の `applyLayoutProperties()` において `validrect.right` をパースし、バルーン DOM (`.balloon`) の `padding-right` へ反映する実装が行われている。

## 実装箇所

- `ui/js/core/actions/balloon-descript/layout.js` `const vr = parseInt(props["validrect.right"], 10);`
