# mousedown\*,当たり判定ID,ファイル名

- **規格**: [mousedown-star.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell-surfaces/cursor-brace/mousedown-star/) (ukadoc-spec/descript/shell-surfaces/cursor-brace/mousedown-star.md)
- **検索語**: mousedown
- **対応状況**: ✅ 実装済

## 突合結果

ui/js/surface/surface-load.js の loadSurfacesTxt において surfaces.txt ファイル・エイリアス・アニメーション・衝突判定定義をパース・解決する実装が行われている。

## 実装箇所

- `crates/nanai-surface/src/parser/helpers/lines.rs:88` `} else if raw_event.starts_with("mousedown") {`
- `ui/ts/core/internal-window-manager.ts:214` `this.element.addEventListener("mousedown", () => {`
- `ui/ts/ui/loading-banner.ts:29` `document.body.addEventListener("mousedown", (e) => {`
- `tests/balloon-drag.test.ts:76` `balloonEl._listeners?.mousedown?.({`
- `crates/nanai-surface/src/parser/helpers/lines.rs:89` `"mousedown"`
- `ui/ts/core/internal-window-manager.ts:308` `dragHandle.addEventListener("mousedown", onDown);`
