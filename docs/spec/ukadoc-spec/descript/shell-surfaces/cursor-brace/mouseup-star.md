# mouseup\*,当たり判定ID,ファイル名

- **規格**: [mouseup-star.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell-surfaces/cursor-brace/mouseup-star/) (ukadoc-spec/descript/shell-surfaces/cursor-brace/mouseup-star.md)
- **検索語**: mouseup
- **対応状況**: ❌ 未実装

## 突合結果

surface-parser.js / surface-animation-manager.js に該当の解析・処理は確認できない。

## 実装箇所

- `ui/js/ghost/balloon-window.js:214` `balloonBox?.addEventListener("mouseup", () => {`
- `ui/js/surface/interaction.js:302` `globalThis.addEventListener("mouseup", onPointerUp);`
- `ui/js/surface/character.js:159` `globalThis.addEventListener("mouseup", onPointerUp);`
- `ui/js/surface/balloon-drag.js:141` `globalThis.addEventListener("mouseup", onEnd);`
