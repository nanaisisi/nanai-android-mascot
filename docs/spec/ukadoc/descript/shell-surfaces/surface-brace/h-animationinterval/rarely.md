# rarely

- **規格**: [rarely.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell-surfaces/surface-brace/h-animationinterval/rarely/) (ukadoc-spec/descript/shell-surfaces/surface-brace/h-animationinterval/rarely.md)
- **検索語**: rarely
- **対応状況**: ✅ 実装済

## 突合結果

surface-animation-manager.js で interval 種別として処理している。

## 実装箇所

- `ui/js/surface/surface-animation-manager.js:90` (コメント) `// sometimes(毎秒1/2), rarely(毎秒1/4), random,N(毎秒1/N)`
- `ui/js/surface/surface-animation-manager.js:92`  `if (intervalStr === "rarely") {`
