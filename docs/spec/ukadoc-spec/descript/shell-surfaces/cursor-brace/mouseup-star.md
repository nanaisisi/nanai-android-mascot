# mouseup\*,当たり判定ID,ファイル名

- **規格**: [mouseup-star.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell-surfaces/cursor-brace/mouseup-star/) (ukadoc-spec/descript/shell-surfaces/cursor-brace/mouseup-star.md)
- **検索語**: mouseup
- **対応状況**: ✅ 実装済

## 突合結果

ui/js/surface/surface-load.js の loadSurfacesTxt において surfaces.txt ファイル・エイリアス・アニメーション・衝突判定定義をパース・解決する実装が行われている。

## 実装箇所

- `crates/nanai-surface/src/parser/helpers/lines.rs:86` `let event = if raw_event.starts_with("mouseup") {`
- `ui/ts/core/internal-window-manager.ts:294` `globalThis.removeEventListener("mouseup", onUp);`
- `tests/balloon-drag.test.ts:98` `globalListeners.mouseup?.();`
- `crates/nanai-surface/src/parser/helpers/lines.rs:87` `"mouseup"`
- `ui/ts/core/internal-window-manager.ts:302` `globalThis.addEventListener("mouseup", onUp);`
- `tests/balloon-window.test.ts:40` `balloonBox.mouseup();`
