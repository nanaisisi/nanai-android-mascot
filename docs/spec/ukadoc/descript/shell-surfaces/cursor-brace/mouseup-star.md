# mouseup\*,当たり判定ID,ファイル名

- **規格**: [mouseup-star.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell-surfaces/cursor-brace/mouseup-star/) (ukadoc-spec/descript/shell-surfaces/cursor-brace/mouseup-star.md)
- **検索語**: mouseup
- **対応状況**: ❓ 要確認(surface 関連語)

## 突合結果

サーフェス処理 (ui/js/surface/) に関連する語「mouseup」が出現。surfaces.txt の該当機能として実装されているかは個別の読解が必要。

## 実装箇所

- `ui/js/surface/interaction.js:214`  `globalThis.addEventListener("mouseup", onPointerUp);`
- `ui/js/surface/balloon-drag.js:117`  `globalThis.addEventListener("mouseup", onEnd);`
