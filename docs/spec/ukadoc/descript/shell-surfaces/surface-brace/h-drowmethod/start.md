# start,ID

- **規格**: [start.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell-surfaces/surface-brace/h-drowmethod/start/) (ukadoc-spec/descript/shell-surfaces/surface-brace/h-drowmethod/start.md)
- **検索語**: start
- **対応状況**: 🔎 コード上に出現(処理の有無は要読解)

## 突合結果

実装コードに「start」が出現。実際の処理内容は未精査。

## 実装箇所

- `ui/windows/desktop-features.js:144`  `const checked = document.getElementById("startup-setting").checked;`
- `ui/js/surface/character.js:43`  `if (tauriWindow && typeof tauriWindow.startDragging === "function") {`
- `ui/js/surface/character.js:45`  `tauriWindow.startDragging();`
- `ui/js/core/app-update.js:24`  `async startNetworkUpdate(targetGhostName = null) {`
- `ui/js/surface/surface-parser.js:48`  `const [start, end] = part.split("-").map((v) => Number.parseInt(v, 10));`
