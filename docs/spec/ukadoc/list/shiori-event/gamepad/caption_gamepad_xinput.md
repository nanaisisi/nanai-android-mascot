# Windows上のSSPにおけるXInput固有の仕様

- **規格**: [caption_gamepad_xinput.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-event/gamepad/caption_gamepad_xinput/) (ukadoc-spec/list/shiori-event/gamepad/caption_gamepad_xinput.md)
- **検索語**: Windows
- **対応状況**: 🔎 コード上に出現(処理の有無は要読解)

## 突合結果

実装コードに「Windows」が出現。実際の処理内容は未精査。

## 実装箇所

- `ui/windows/multi-window.js:117`  `export function initializeAllWindows() {`
- `ui/windows/multi-window.js:128`  `export function minimizeAllWindows() {`
- `ui/windows/multi-window.js:132`  `export function restoreAllWindows() {`
- `ui/windows/multi-window.js:136`  `export function closeAllWindows() {`
- `ui/windows/multi-window.js:176`  `globalThis.initializeAllWindows = initializeAllWindows;`
