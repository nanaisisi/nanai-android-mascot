# number.y,座標

- **規格**: [number.y.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/) (ukadoc-spec/descript/balloon/descript-txt/number.y.md)
- **検索語**: number.y
- **対応状況**: ✅ 対応済

## 突合結果

`ui/js/core/actions/balloon-descript/layout.js` の `applyLayoutProperties()` において `props["number.y"]` をパースし、`--balloon-number-y` カスタムプロパティへ反映する実装が行われている。

## 実装箇所

- `ui/js/core/actions/balloon-descript/layout.js` `if (!Number.isNaN(numY)) root.style.setProperty("--balloon-number-y", \`${numY}px\`);`
