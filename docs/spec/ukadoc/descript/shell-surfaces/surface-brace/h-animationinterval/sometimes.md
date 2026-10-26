# sometimes

- **規格**: [sometimes.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell-surfaces/surface-brace/h-animationinterval/sometimes/) (ukadoc-spec/descript/shell-surfaces/surface-brace/h-animationinterval/sometimes.md)
- **検索語**: sometimes
- **対応状況**: ❓ 要確認(surface 関連語)

## 突合結果

サーフェス処理 (ui/js/surface/) に関連する語「sometimes」が出現。surfaces.txt の該当機能として実装されているかは個別の読解が必要。

## 実装箇所

- `ui/js/surface/surface-parser.js:162`  `anim = { id: animId, interval: "sometimes", patterns: [] };`
- `ui/js/surface/surface-animation-manager.js:49`  `const intervalStr = (anim.interval || "sometimes").toLowerCase();`
- `ui/js/surface/surface-animation-manager.js:90` (コメント) `// sometimes(毎秒1/2), rarely(毎秒1/4), random,N(毎秒1/N)`
- `ui/js/surface/surface-animation-manager.js:91`  `let probability = 0.5; // sometimes`
