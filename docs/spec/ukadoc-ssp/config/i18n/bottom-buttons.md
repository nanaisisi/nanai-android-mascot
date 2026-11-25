# 下部のボタン

- **規格**: [i18n.md](../../../../ukadoc-ssp/config/i18n.md) ([公式版](https://ukatech.shillest.net/ukadoc-ssp/config/i18n/))
- **検索語**: help, close
- **対応状況**: ✅ 実装済

## 突合結果

本体設定ダイアログ下部の「ヘルプ」「閉じる」ボタン。


## 実装箇所

- `ui/ts/core/actions/menu-action-system.ts:32` `if (action === "inquire" || action === "help") {`
- `ui/css/base.css:101` `.help-section li {`
- `tests/modal-settings-handlers.test.ts:169` `getEl("config-help-btn").click();`
- `ui/ts/core/actions/menu-action-system.ts:33` `context.modalManager?.show?.("help-modal-content");`
- `ui/ts/ui/context-menu-keyboard.ts:17` `a: "help", // 情報 (About)`
- `tests/surface-collision-detection.test.ts:453` `"*": [{ event: "mousemove", collision: "GlobalPart", cursor: "help" }],`
