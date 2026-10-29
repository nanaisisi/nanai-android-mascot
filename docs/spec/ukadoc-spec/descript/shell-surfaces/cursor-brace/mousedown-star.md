# mousedown\*,当たり判定ID,ファイル名

- **規格**: [mousedown-star.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell-surfaces/cursor-brace/mousedown-star/) (ukadoc-spec/descript/shell-surfaces/cursor-brace/mousedown-star.md)
- **検索語**: mousedown
- **対応状況**: ❌ 未実装

## 突合結果

surface-parser.js / surface-animation-manager.js に該当の解析・処理は確認できない。

## 実装箇所

- `ui/js/ghost/balloon-window.js:208` `balloonBox?.addEventListener("mousedown", (e) => {`
- `ui/js/surface/interaction.js:124` `e.type === "mousedown" &&`
- `ui/js/surface/interaction.js:300` `target.addEventListener("mousedown", onPointerDown);`
- `ui/js/surface/character.js:157` `root?.addEventListener("mousedown", onPointerDown);`
- `ui/js/surface/balloon-drag.js:130` `balloon.addEventListener("mousedown", (e) => {`
