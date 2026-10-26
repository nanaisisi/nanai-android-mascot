# base

- **規格**: [base.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell-surfaces/surface-brace/h-drowmethod/base/) (ukadoc-spec/descript/shell-surfaces/surface-brace/h-drowmethod/base.md)
- **検索語**: base
- **対応状況**: 🔎 コード上に出現(処理の有無は要読解)

## 突合結果

実装コードに「base」が出現。実際の処理内容は未精査。

## 実装箇所

- `ui/js/surface/surface-animation-manager.js:119`  `async playAnimationPatterns(anim, baseSurfaceId, scopeId) {`
- `ui/js/surface/surface-animation-manager.js:125`  `if (String(this.manager.currentSurfaceId) !== String(baseSurfaceId)) break;`
- `ui/js/surface/surface-animation-manager.js:129`  `await gc.updateSurface(baseSurfaceId, scopeId);`
- `ui/js/surface/surface-animation-manager.js:138`  `if (String(this.manager.currentSurfaceId) === String(baseSurfaceId)) {`
- `ui/js/surface/surface-animation-manager.js:139`  `await gc.updateSurface(baseSurfaceId, scopeId);`
