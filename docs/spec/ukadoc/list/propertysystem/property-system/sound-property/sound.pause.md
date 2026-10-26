# pause

- **規格**: [sound.pause.md](https://ukatech.shillest.net/ukadoc-spec/list/propertysystem/property-system/sound-property/sound.pause/)
- **検索語**: pause
- **対応状況**: 🔎 コード上に出現(処理の有無は要読解)

## 突合結果

実装コードに「pause」が出現。実際の処理内容は未精査。

## 実装箇所

- `ui/js/ghost/sakura-script.js:172`  `case "pause":`
- `ui/js/ghost/sakura-parser.js:7` (コメント) `* @property {string} type - トークン種別 ('scope'|'surface'|'animation'|'wait'|'newline'|'clear'`
- `ui/js/ghost/sakura-parser.js:140`  `tokens.push({ type: "pause" });`
