# font.underline,0/1

- **規格**: [font.underline.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/) (ukadoc-spec/descript/balloon/descript-txt/font.underline.md)
- **検索語**: font.underline
- **対応状況**: ✅ 対応済

## 突合結果

`ui/js/core/actions/balloon-descript/font.js` の `applyFontProperties()` において `props["font.underline"] === "1"` を検出し、`--balloon-text-decoration` カスタムプロパティ（`underline`）へ反映する実装が行われている。

## 実装箇所

- `ui/js/core/actions/balloon-descript/font.js:46` `// [font.underline,0/1]: props["font.underline"]`
- `ui/js/core/actions/balloon-descript/font.js:48` `props["font.underline"] === "1" ||`
- `ui/js/core/actions/balloon-descript/font.js:49` `props["font.underline"]?.toLowerCase() === "true"`
- `tests/balloon-descript.test.js:84` `"font.underline": "1",`
- `tests/core-actions.test.js:37` `"font.underline": "0",`
