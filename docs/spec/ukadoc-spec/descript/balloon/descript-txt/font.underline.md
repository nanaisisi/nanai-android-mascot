# font.underline,0/1

- **規格**: [font.underline.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/) (ukadoc-spec/descript/balloon/descript-txt/font.underline.md)
- **検索語**: font.underline
- **対応状況**: ✅ 対応済

## 突合結果

`ui/js/core/actions/balloon-descript/font.js` の `applyFontProperties()` において `props["font.underline"] === "1"` を検出し、`--balloon-text-decoration` カスタムプロパティ（`underline`）へ反映する実装が行われている。

## 実装箇所

- `ui/js/core/actions/balloon-descript/font/base.js:36` `props["font.underline"] === "1" ||`
- `ui/js/core/actions/balloon-descript/font/base.js:37` `props["font.underline"]?.toLowerCase() === "true"`
