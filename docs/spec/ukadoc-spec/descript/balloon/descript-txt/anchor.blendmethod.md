# anchor.blendmethod,コマンド

- **規格**: [anchor.blendmethod.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/) (ukadoc-spec/descript/balloon/descript-txt/anchor.blendmethod.md)
- **検索語**: anchor.blendmethod
- **対応状況**: ✅ 実装済

## 突合結果

`ui/js/core/actions/balloon-descript/font.js` の `applyFontProperties()` 内 `applyGroupProperties("anchor", "--balloon-anchor")` において `props["anchor.blendmethod"]` を検出し、`--balloon-anchor-blendmethod` カスタムプロパティへ反映する実装が行われている。

## 実装箇所

- `ui/js/core/actions/balloon-descript/font/group.js:5` `* UKADOC仕様 (anchor.style, anchor.blendmethod, anchor.font.color.r/g/b, anchor.fo`
- `ui/js/core/actions/balloon-descript/font/group.js:11` `* [anchor.blendmethod,合成方法]`
- `ui/js/core/actions/balloon-descript/font/group.js:85` `// [anchor.blendmethod / cursor.blendmethod / *.blendmethod]:`
