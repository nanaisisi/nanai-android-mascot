# number.xr,座標

- **規格**: [number.xr.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/) (ukadoc-spec/descript/balloon/descript-txt/number.xr.md)
- **検索語**: number.xr
- **対応状況**: ✅ 対応済

## 突合結果

`ui/js/core/actions/balloon-descript/layout.js` の `applyLayoutProperties()` において `props["number.xr"]` をパースし、`--balloon-number-xr` カスタムプロパティへ反映する実装が行われている。

## 実装箇所

- `ui/js/core/actions/balloon-descript/layout.js` `if (!Number.isNaN(numXR)) root.style.setProperty("--balloon-number-xr", \`${numXR}px\`);`
