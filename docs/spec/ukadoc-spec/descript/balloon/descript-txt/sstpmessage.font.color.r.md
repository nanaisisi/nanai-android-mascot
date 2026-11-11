# sstpmessage.font.color.r,数値

- **規格**: [sstpmessage.font.color.r.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/) (ukadoc-spec/descript/balloon/descript-txt/sstpmessage.font.color.r.md)
- **検索語**: sstpmessage.font.color.r
- **対応状況**: ✅ 実装済

## 突合結果

`ui/js/core/actions/balloon-descript/font.js` の `applyFontProperties()` において `rgbFromComponents(props, "sstpmessage.font.color")` を通じて `sstpmessage.font.color.r/g/b` を抽出し、`--balloon-sstp-font-color` カスタムプロパティへバインドする実装が行われている。

## 実装箇所

- `ui/ts/core/actions/balloon-descript/font/special.ts:48` `props["sstpmessage.font.color.r"] ||`
- `tests/core-coverage-boost/balloon-descript-coverage.test.ts:75` `"sstpmessage.font.color.r": "50",`
- `tests/sstp-fmo/balloon-styling.test.ts:13` `"sstpmessage.font.color.r": "255",`
