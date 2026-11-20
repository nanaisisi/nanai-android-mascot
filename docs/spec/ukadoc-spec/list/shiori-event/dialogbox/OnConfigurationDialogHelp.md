# OnConfigurationDialogHelp

- **規格**: [OnConfigurationDialogHelp.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-event/dialogbox/OnConfigurationDialogHelp/) (ukadoc-spec/list/shiori-event/dialogbox/OnConfigurationDialogHelp.md)
- **検索語**: OnConfigurationDialogHelp
- **対応状況**: ✅ 実装済

## 突合結果

設定ダイアログ内のヘルプボタン押下時に `OnConfigurationDialogHelp` SHIORIイベントを送信する処理を実装 (`ui/ts/ui/modal-settings-handlers.ts` -> `OnConfigurationDialogHelp`)。

## 実装箇所

- `ui/ts/ghost/shiori-protocol.ts:159` `CONFIGURATION_DIALOG_HELP: "OnConfigurationDialogHelp"`
- `ui/ts/ui/modal-settings-handlers.ts:381` `this.app.ghostController?.sendShioriEvent("OnConfigurationDialogHelp", [`
