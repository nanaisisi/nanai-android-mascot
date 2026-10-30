# sstpmessage.font.color.g,数値

- **規格**: [sstpmessage.font.color.g.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/) (ukadoc-spec/descript/balloon/descript-txt/sstpmessage.font.color.g.md)
- **検索語**: sstpmessage.font.color.g
- **対応状況**: ✅ 対応済

## 突合結果

`ui/js/core/actions/balloon-descript/font.js` の `applyFontProperties()` において `rgbFromComponents(props, "sstpmessage.font.color")` を通じて `sstpmessage.font.color.r/g/b` を抽出し、`--balloon-sstp-font-color` カスタムプロパティへバインドする実装が行われている。

## 実装箇所

- `ui/js/core/actions/balloon-descript/font.js:342` `// [sstpmessage.font.name,フォント名], [sstpmessage.font.height,サイズ], [sstpmessage.fo`
- `ui/js/core/actions/balloon-descript/font.js:357` `props["sstpmessage.font.color.g"] ||`
