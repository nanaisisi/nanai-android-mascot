# validrect.bottom,座標

- **規格**: [validrect.bottom.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/) (ukadoc-spec/descript/balloon/descript-txt/validrect.bottom.md)
- **検索語**: validrect.bottom
- **対応状況**: ✅ 対応済

## 突合結果

`ui/js/core/actions/balloon-descript/layout.js` の `applyLayoutProperties()` において `validrect.bottom` をパースし、バルーン DOM (`.balloon`) の `padding-bottom` へ反映する実装が行われている。

## 実装箇所

- `ui/js/core/actions/balloon-descript/layout.js` `const vb = parseInt(props["validrect.bottom"], 10);`
