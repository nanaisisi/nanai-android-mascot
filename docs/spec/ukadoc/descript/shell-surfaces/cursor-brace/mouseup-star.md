# mouseup\*,当たり判定ID,ファイル名

- **規格**: [mouseup-star.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell-surfaces/cursor-brace/mouseup-star/) (ukadoc-spec/descript/shell-surfaces/cursor-brace/mouseup-star.md)
- **検索語**: mouseup
- **対応状況**: 🔎 コード上に出現(処理の有無は要読解)

## 突合結果

実装コードに「mouseup」が出現。実際の処理内容は未精査。

## 実装箇所

- `ui/js/surface/interaction.js:214`  `globalThis.addEventListener("mouseup", onPointerUp);`
- `ui/js/surface/balloon-drag.js:117`  `globalThis.addEventListener("mouseup", onEnd);`
