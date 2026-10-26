# stop,ID

- **規格**: [stop.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell-surfaces/surface-brace/h-drowmethod/stop/) (ukadoc-spec/descript/shell-surfaces/surface-brace/h-drowmethod/stop.md)
- **検索語**: stop
- **対応状況**: ⚠️ 一部対応

## 突合結果

surface-parser.js が解析 (パターン種別など) するが、描画への反映は個別未確認。

## 実装箇所

- `ui/js/surface/surface-animation-manager.js:18`  `stopAnimations(scopeId = 0) {`
- `ui/js/surface/surface.js:109`  `this.animationManager.stopAnimations(scopeId);`
- `ui/js/surface/surface.js:113`  `stopAnimations(scopeId = 0) {`
- `ui/js/surface/surface.js:114`  `this.animationManager.stopAnimations(scopeId);`
- `ui/js/ghost/balloon-window.js:21`  `e.stopPropagation();`
