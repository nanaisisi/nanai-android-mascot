# mousedown\*,当たり判定ID,ファイル名

- **規格**: [mousedown-star.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell-surfaces/cursor-brace/mousedown-star/) (ukadoc-spec/descript/shell-surfaces/cursor-brace/mousedown-star.md)
- **検索語**: mousedown
- **対応状況**: ✅ 対応済 (surface-load.js)\n\n## 突合結果\n\nui/js/surface/surface-load.js の loadSurfacesTxt において surfaces.txt ファイル・エイリアス・アニメーション・衝突判定定義をパース・解決する実装が行われている。\n\n## 実装箇所

- `ui/js/ghost/balloon-window.js:239` `balloonBox?.addEventListener("mousedown", (e) => {`
- `ui/js/surface/balloon-drag.js:130` `balloon.addEventListener("mousedown", (e) => {`
- `ui/js/surface/character.js:157` `root?.addEventListener("mousedown", onPointerDown);`
- `ui/js/surface/interaction.js:124` `e.type === "mousedown" &&`
- `ui/js/surface/interaction.js:300` `target.addEventListener("mousedown", onPointerDown);`
