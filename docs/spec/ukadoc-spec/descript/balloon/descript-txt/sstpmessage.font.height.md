# sstpmessage.font.height,サイズ

- **規格**: [sstpmessage.font.height.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/) (ukadoc-spec/descript/balloon/descript-txt/sstpmessage.font.height.md)
- **検索語**: sstpmessage.font.height
- **対応状況**: ✅ 実装済

## 突合結果

`ui/js/core/actions/balloon-descript/font.js` の `applyFontProperties()` において `props["sstpmessage.font.height"]` をパースし、`--balloon-sstp-font-size` カスタムプロパティへバインドする実装が行われている。

## 実装箇所

- `ui/ts/core/actions/balloon-descript/font/special.ts:42` `const sstpFontHeight = parseInt(props["sstpmessage.font.height"], 10);`
- `tests/core-coverage-boost/balloon-descript-coverage.test.ts:74` `"sstpmessage.font.height": "14",`
- `tests/sstp-fmo/balloon-styling.test.ts:12` `"sstpmessage.font.height": "14",`
