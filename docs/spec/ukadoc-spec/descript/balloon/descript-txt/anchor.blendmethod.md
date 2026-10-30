# anchor.blendmethod,コマンド

- **規格**: [anchor.blendmethod.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/) (ukadoc-spec/descript/balloon/descript-txt/anchor.blendmethod.md)
- **検索語**: anchor.blendmethod
- **対応状況**: ✅ 対応済

## 突合結果

`ui/js/core/actions/balloon-descript/font.js` の `applyFontProperties()` 内 `applyGroupProperties("anchor", "--balloon-anchor")` において `props["anchor.blendmethod"]` を検出し、`--balloon-anchor-blendmethod` カスタムプロパティへ反映する実装が行われている。

## 実装箇所

- `ui/js/core/actions/balloon-descript/font.js:182` `// [anchor.pen.color.r,数値], [anchor.pen.color.g,数値], [anchor.pen.color.b,数値], [a`
- `ui/js/core/actions/balloon-descript/font.js:190` `props["anchor.blendmethod"]`
