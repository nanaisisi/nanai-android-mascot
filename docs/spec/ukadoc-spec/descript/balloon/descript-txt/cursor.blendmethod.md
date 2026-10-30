# cursor.blendmethod,コマンド

- **規格**: [cursor.blendmethod.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/) (ukadoc-spec/descript/balloon/descript-txt/cursor.blendmethod.md)
- **検索語**: cursor.blendmethod
- **対応状況**: ✅ 対応済

## 突合結果

`ui/js/core/actions/balloon-descript/font.js` の `applyFontProperties()` 内 `applyGroupProperties("cursor", "--balloon-cursor")` において `props["cursor.blendmethod"]` を検出し、`--balloon-cursor-blendmethod` カスタムプロパティへ反映する実装が行われている。

## 実装箇所

- `ui/js/core/actions/balloon-descript/font.js:254` `// [cursor.style,形状], [cursor.blendmethod,コマンド], [cursor.font.color.r,数値], [curs`
- `ui/js/core/actions/balloon-descript/font.js:257` `props["cursor.blendmethod"] ||`
