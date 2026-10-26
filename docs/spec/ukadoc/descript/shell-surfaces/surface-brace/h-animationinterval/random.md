# random,数値

- **規格**: [random.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell-surfaces/surface-brace/h-animationinterval/random/) (ukadoc-spec/descript/shell-surfaces/surface-brace/h-animationinterval/random.md)
- **検索語**: random
- **対応状況**: ❓ 要確認(surface 関連語)

## 突合結果

サーフェス処理 (ui/js/surface/) に関連する語「random」が出現。surfaces.txt の該当機能として実装されているかは個別の読解が必要。

## 実装箇所

- `ui/js/surface/surface-animation-manager.js:90` (コメント) `// sometimes(毎秒1/2), rarely(毎秒1/4), random,N(毎秒1/N)`
- `ui/js/surface/surface-animation-manager.js:94`  `} else if (intervalStr.startsWith("random")) {`
- `ui/js/surface/surface-animation-manager.js:108`  `if (Math.random() <= probability) {`
- `ui/windows/multi-window.js:96`  `const success = Math.random() > 0.3;`
- `ui/js/core/app-settings.js:58`  `const talkInterval = 60 + Math.floor(Math.random() * 30);`
