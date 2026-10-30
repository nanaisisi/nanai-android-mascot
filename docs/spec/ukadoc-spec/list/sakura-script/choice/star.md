# \*

- **規格**: [star.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/choice/star/) (ukadoc-spec/list/sakura-script/choice/star.md)
- **検索語**: \*
- **対応状況**: ❌ 検出なし

## 突合結果

実装コードに「\*」が見つからない(短いトークンのため誤検出の可能性大)。


## 実装箇所

- `ui/coverage/prettify.js:56` `"(?:^^\\.?|[+-]|\\!|\\!=|\\!==|\\#|\\%|\\%=|&|&&|&&=|&=|\\(|\\*|\\*=|\\+=|\\,|\\`
- `ui/coverage/prettify.js:455` `S.push([j, /^\/\*[\s\S]*?(?:\*\/|$)/, null]);`
- `ui/coverage/prettify.js:920` `[PR.PR_COMMENT, /^\/\*[^*]*\*+(?:[^\/*][^*]*\*+)*\//],`
- `ui/js/surface/surface-load.js:8` `// [mousedown\*,当たり判定ID,ファイル名]`
- `ui/js/surface/surface-load.js:9` `// [mousehover\*,当たり判定ID,ファイル名]`
