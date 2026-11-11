# sstpmessage.xr,座標

- **規格**: [sstpmessage.xr.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/) (ukadoc-spec/descript/balloon/descript-txt/sstpmessage.xr.md)
- **検索語**: sstpmessage.xr
- **対応状況**: ✅ 実装済

## 突合結果

`ui/js/core/actions/balloon-descript/layout.js` の `applyLayoutProperties()` において `props["sstpmessage.xr"]` をパースし、`--balloon-sstpmessage-xr` カスタムプロパティへ反映する実装が行われている。

## 実装箇所

- `ui/ts/core/actions/balloon-descript/layout/position.ts:35` `// [sstpmessage.x,座標], [sstpmessage.y,座標], [sstpmessage.xr,座標], [sstpmessage.yb,`
- `ui/ts/core/actions/balloon-descript/layout/position.ts:38` `const sstpXR = parseInt(props["sstpmessage.xr"], 10);`
- `tests/balloon-descript/all-properties/mock-props.ts:84` `"sstpmessage.xr": "-30",`
- `tests/balloon-descript-layout/position.test.ts:35` `"sstpmessage.xr": "-5",`
- `tests/sstp-fmo/balloon-styling.test.ts:34` `"sstpmessage.xr": "80",`
