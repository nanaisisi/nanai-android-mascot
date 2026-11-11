# sstpmessage.yb,座標

- **規格**: [sstpmessage.yb.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/) (ukadoc-spec/descript/balloon/descript-txt/sstpmessage.yb.md)
- **検索語**: sstpmessage.yb
- **対応状況**: ✅ 実装済

## 突合結果

`ui/js/core/actions/balloon-descript/layout.js` の `applyLayoutProperties()` において `props["sstpmessage.yb"]` をパースし、`--balloon-sstpmessage-yb` カスタムプロパティへ反映する実装が行われている。

## 実装箇所

- `ui/ts/core/actions/balloon-descript/layout/position.ts:35` `// [sstpmessage.x,座標], [sstpmessage.y,座標], [sstpmessage.xr,座標], [sstpmessage.yb,`
- `ui/ts/core/actions/balloon-descript/layout/position.ts:39` `const sstpYB = parseInt(props["sstpmessage.yb"], 10);`
- `tests/balloon-descript/all-properties/mock-props.ts:85` `"sstpmessage.yb": "-40",`
- `tests/balloon-descript-layout/position.test.ts:36` `"sstpmessage.yb": "-10",`
- `tests/sstp-fmo/balloon-styling.test.ts:35` `"sstpmessage.yb": "90",`
