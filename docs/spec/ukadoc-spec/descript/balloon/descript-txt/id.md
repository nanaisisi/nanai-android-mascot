# id,ID名

- **規格**: [id.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/) (ukadoc-spec/descript/balloon/descript-txt/id.md)
- **検索語**: id,ID名
- **対応状況**: ✅ 対応済

## 突合結果

`ui/js/core/actions/balloon-descript/font.js` の `applyFontProperties()` において `props["id"]` を検出し、`--balloon-id` カスタムプロパティへ反映する実装が行われている。

## 実装箇所

- `ui/js/core/actions/balloon-descript/font.js` `if (props["id"]) root.style.setProperty("--balloon-id", props["id"]);`
