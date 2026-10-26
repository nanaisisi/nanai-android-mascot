# mousedown\*,当たり判定ID,ファイル名

- **規格**: [mousedown-star.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell-surfaces/cursor-brace/mousedown-star/) (ukadoc-spec/descript/shell-surfaces/cursor-brace/mousedown-star.md)
- **検索語**: mousedown
- **対応状況**: ❓ 要確認(surface 関連語)

## 突合結果

サーフェス処理 (ui/js/surface/) に関連する語「mousedown」が出現。surfaces.txt の該当機能として実装されているかは個別の読解が必要。

## 実装箇所

- `ui/js/surface/character.js:38`  `root?.addEventListener("mousedown", (e) => {`
- `ui/js/ghost/balloon-window.js:83`  `balloonBox?.addEventListener("mousedown", (e) => {`
- `ui/js/surface/interaction.js:212`  `target.addEventListener("mousedown", onPointerDown);`
- `ui/js/surface/balloon-drag.js:106`  `balloon.addEventListener("mousedown", (e) => {`
