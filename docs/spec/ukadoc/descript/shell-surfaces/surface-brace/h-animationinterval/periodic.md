# periodic,数値

- **規格**: [periodic.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell-surfaces/surface-brace/h-animationinterval/periodic/) (ukadoc-spec/descript/shell-surfaces/surface-brace/h-animationinterval/periodic.md)
- **検索語**: periodic
- **対応状況**: ✅ 実装済

## 突合結果

surface-animation-manager.js で interval 種別として処理している。

## 実装箇所

- `ui/js/surface/surface-animation-manager.js:62` (コメント) `// periodic,秒: 指定秒数間隔で定期再生`
- `ui/js/surface/surface-animation-manager.js:63`  `if (intervalStr.startsWith("periodic")) {`
