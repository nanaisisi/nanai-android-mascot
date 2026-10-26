# start,ID

- **規格**: [start.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell-surfaces/surface-brace/h-drowmethod/start/) (ukadoc-spec/descript/shell-surfaces/surface-brace/h-drowmethod/start.md)
- **検索語**: start
- **対応状況**: ❓ 要確認(surface 関連語)

## 突合結果

サーフェス処理 (ui/js/surface/) に関連する語「start」が出現。surfaces.txt の該当機能として実装されているかは個別の読解が必要。

## 実装箇所

- `ui/windows/desktop-features.js:144`  `const checked = document.getElementById("startup-setting").checked;`
- `ui/js/surface/character.js:43`  `if (tauriWindow && typeof tauriWindow.startDragging === "function") {`
- `ui/js/surface/character.js:45`  `tauriWindow.startDragging();`
- `ui/js/core/app-update.js:24`  `async startNetworkUpdate(targetGhostName = null) {`
- `ui/js/surface/surface-parser.js:48`  `const [start, end] = part.split("-").map((v) => Number.parseInt(v, 10));`
