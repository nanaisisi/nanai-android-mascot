# sstpmessage.font.height,サイズ

- **規格**: [sstpmessage.font.height.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/) (ukadoc-spec/descript/balloon/descript-txt/sstpmessage.font.height.md)
- **検索語**: sstpmessage.font.height
- **対応状況**: ✅ 対応済

## 突合結果

`ui/js/core/actions/balloon-descript/font.js` の `applyFontProperties()` において `props["sstpmessage.font.height"]` をパースし、`--balloon-sstp-font-size` カスタムプロパティへバインドする実装が行われている。

## 実装箇所

- `ui/js/core/actions/balloon-descript/font.js:327` `// [sstpmessage.font.name,フォント名], [sstpmessage.font.height,サイズ], [sstpmessage.fo`
- `ui/js/core/actions/balloon-descript/font.js:335` `const sstpFontHeight = parseInt(props["sstpmessage.font.height"], 10);`
