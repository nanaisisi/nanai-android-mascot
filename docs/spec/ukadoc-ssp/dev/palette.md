# 開発者向けヘルプ：開発用パレット

- **規格**: [dev/palette.md](https://ukatech.shillest.net/ukadoc-ssp/dev/palette/) (ukadoc-ssp/dev/palette.md)
- **対応状況**: ✅ 実装済

## 突合結果

さくらスクリプト手動送信、テスト発話


## 実装箇所

- `ui/ts/core/actions/menu-action-dispatcher.ts:5` `import { showDevPalette } from "../../ui/dev-palette.js";`
- `ui/ts/ui/context-menu-keyboard.ts:48` `dispatcher.dispatchAction("dev-palette");`
- `tests/menu-dispatcher.test.ts:60` `test("showDevPalette shows and hides modal host window in Tauri and handles dev-`
- `ui/ts/core/actions/menu-action-dispatcher.ts:269` `action === "dev-palette" ||`
- `ui/ts/ui/dev-palette.ts:28` `const existing = document.getElementById("nanai-dev-palette-window");`
- `tests/menu-dispatcher.test.ts:92` `if (sel === "#close-dev-palette-btn") {`
