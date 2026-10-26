# mousedown\*,当たり判定ID,ファイル名

- **規格**: [mousedown-star.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell-surfaces/cursor-brace/mousedown-star/) (ukadoc-spec/descript/shell-surfaces/cursor-brace/mousedown-star.md)
- **検索語**: mousedown
- **対応状況**: 🔎 コード上に出現(処理の有無は要読解)

## 突合結果

実装コードに「mousedown」が出現。実際の処理内容は未精査。

## 実装箇所

- `ui/js/surface/character.js:38`  `root?.addEventListener("mousedown", (e) => {`
- `ui/js/ghost/balloon-window.js:83`  `balloonBox?.addEventListener("mousedown", (e) => {`
- `ui/js/surface/interaction.js:212`  `target.addEventListener("mousedown", onPointerDown);`
- `ui/js/surface/balloon-drag.js:106`  `balloon.addEventListener("mousedown", (e) => {`
