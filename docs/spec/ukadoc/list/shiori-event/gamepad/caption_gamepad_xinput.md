# Windows上のSSPにおけるXInput固有の仕様

- **規格**: [caption_gamepad_xinput.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-event/gamepad/caption_gamepad_xinput/) (ukadoc-spec/list/shiori-event/gamepad/caption_gamepad_xinput.md)
- **検索語**: Windows
- **対応状況**: ❌ 未実装(誤検出)

## 突合結果

ヒットしたのは無関係な関数名(initializeAllWindows 等)。ゲームパッド入力イベントの処理はない。

## 実装箇所

- `ui/windows/multi-window.js:117` `export function initializeAllWindows() {`
- `ui/windows/multi-window.js:128` `export function minimizeAllWindows() {`
- `ui/windows/multi-window.js:132` `export function restoreAllWindows() {`
- `ui/windows/multi-window.js:136` `export function closeAllWindows() {`
- `ui/windows/multi-window.js:176` `globalThis.initializeAllWindows = initializeAllWindows;`
