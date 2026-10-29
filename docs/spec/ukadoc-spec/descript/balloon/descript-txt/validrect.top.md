# validrect.top,座標

- **規格**: [validrect.top.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/) (ukadoc-spec/descript/balloon/descript-txt/validrect.top.md)
- **検索語**: validrect.top
- **対応状況**: ✅ 対応済

## 突合結果

`ui/js/core/actions/balloon-descript/layout.js` の `applyLayoutProperties()` において `validrect.top` をパースし、バルーン DOM (`.balloon`) の `padding-top` へ反映する実装が行われている。

## 実装箇所

- `ui/js/core/actions/balloon-descript/layout.js` `const vt = parseInt(props["validrect.top"], 10);`
