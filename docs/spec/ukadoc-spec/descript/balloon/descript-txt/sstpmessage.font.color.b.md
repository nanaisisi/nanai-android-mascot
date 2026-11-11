# sstpmessage.font.color.b,数値

- **規格**: [sstpmessage.font.color.b.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/) (ukadoc-spec/descript/balloon/descript-txt/sstpmessage.font.color.b.md)
- **検索語**: sstpmessage.font.color.b
- **対応状況**: ✅ 実装済

## 突合結果

`ui/js/core/actions/balloon-descript/font.js` の `applyFontProperties()` において `rgbFromComponents(props, "sstpmessage.font.color")` を通じて `sstpmessage.font.color.r/g/b` を抽出し、`--balloon-sstp-font-color` カスタムプロパティへバインドする実装が行われている。

## 実装箇所

- `ui/ts/core/actions/balloon-descript/font/special.ts:50` `props["sstpmessage.font.color.b"]`
- `tests/core-coverage-boost/balloon-descript-coverage.test.ts:77` `"sstpmessage.font.color.b": "70",`
- `tests/sstp-fmo/balloon-styling.test.ts:15` `"sstpmessage.font.color.b": "50",`
