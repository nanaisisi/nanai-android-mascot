# number.yb,座標

- **規格**: [number.yb.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/) (ukadoc-spec/descript/balloon/descript-txt/number.yb.md)
- **検索語**: number.yb
- **対応状況**: ✅ 対応済

## 突合結果

`ui/js/core/actions/balloon-descript/layout.js` の `applyLayoutProperties()` において `props["number.yb"]` をパースし、`--balloon-number-yb` カスタムプロパティへ反映する実装が行われている。

## 実装箇所

- `ui/js/core/actions/balloon-descript/layout.js` `if (!Number.isNaN(numYB)) root.style.setProperty("--balloon-number-yb", \`${numYB}px\`);`
