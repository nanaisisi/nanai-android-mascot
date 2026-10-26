# pause

- **規格**: [sound.pause.md](https://ukatech.shillest.net/ukadoc-spec/list/propertysystem/property-system/sound-property/sound.pause/)
- **検索語**: pause
- **対応状況**: ❌ 未実装(誤検出)

## 突合結果

ヒットしたのは一般的な語「pause」の無関係な出現。該当の仕様に対応する処理は確認できない。

## 実装箇所

- `ui/js/ghost/sakura-script.js:172`  `case "pause":`
- `ui/js/ghost/sakura-parser.js:7` (コメント) `* @property {string} type - トークン種別 ('scope'|'surface'|'animation'|'wait'|'newline'|'clear'`
- `ui/js/ghost/sakura-parser.js:140`  `tokens.push({ type: "pause" });`
