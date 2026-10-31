# sstpmessage.font.name,フォント名

- **規格**: [sstpmessage.font.name.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/) (ukadoc-spec/descript/balloon/descript-txt/sstpmessage.font.name.md)
- **検索語**: sstpmessage.font.name
- **対応状況**: ✅ 対応済

## 突合結果

`ui/js/core/actions/balloon-descript/font.js` の `applyFontProperties()` において `props["sstpmessage.font.name"]` を検出し、`--balloon-sstp-font-family` カスタムプロパティへバインドする実装が行われている。

## 実装箇所

- `ui/js/core/actions/balloon-descript/font/special.js:35` `const sstpFontName = props["sstpmessage.font.name"];`
