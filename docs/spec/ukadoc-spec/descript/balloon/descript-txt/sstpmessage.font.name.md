# sstpmessage.font.name,フォント名

- **規格**: [sstpmessage.font.name.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/) (ukadoc-spec/descript/balloon/descript-txt/sstpmessage.font.name.md)
- **検索語**: sstpmessage.font.name
- **対応状況**: ✅ 実装済

## 突合結果

`ui/js/core/actions/balloon-descript/font.js` の `applyFontProperties()` において `props["sstpmessage.font.name"]` を検出し、`--balloon-sstp-font-family` カスタムプロパティへバインドする実装が行われている。

## 実装箇所

- `ui/ts/core/actions/balloon-descript/font/special.ts:35` `const sstpFontName = props["sstpmessage.font.name"];`
- `tests/core-coverage-boost/balloon-descript-coverage.test.ts:73` `"sstpmessage.font.name": "Consolas",`
- `tests/sstp-fmo/balloon-styling.test.ts:11` `"sstpmessage.font.name": "MS Gothic",`
