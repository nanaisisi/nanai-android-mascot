# mouseup\*,当たり判定ID,ファイル名

- **規格**: [mouseup-star.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell-surfaces/cursor-brace/mouseup-star/) (ukadoc-spec/descript/shell-surfaces/cursor-brace/mouseup-star.md)
- **検索語**: mouseup
- **対応状況**: ✅ 対応済 (surface-load.js)\n\n## 突合結果\n\nui/js/surface/surface-load.js の loadSurfacesTxt において surfaces.txt ファイル・エイリアス・アニメーション・衝突判定定義をパース・解決する実装が行われている。\n\n## 実装箇所

- `ui/js/ghost/balloon-window.js:224` `balloonBox?.addEventListener("mouseup", () => {`
- `ui/js/surface/balloon-drag.js:141` `globalThis.addEventListener("mouseup", onEnd);`
- `ui/js/surface/character.js:159` `globalThis.addEventListener("mouseup", onPointerUp);`
- `ui/js/surface/interaction.js:302` `globalThis.addEventListener("mouseup", onPointerUp);`
- `ui/js/surface/surface-load.js:11` `// [mouseup\*,当たり判定ID,ファイル名]`
