# OnConfigurationDialogHelp

- **規格**: [OnConfigurationDialogHelp.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-event/dialogbox/OnConfigurationDialogHelp/) (ukadoc-spec/list/shiori-event/dialogbox/OnConfigurationDialogHelp.md)
- **検索語**: OnConfigurationDialogHelp
- **対応状況**: ✅ 実装済

## 突合結果

設定ダイアログ (`settings-modal-content`) 内のヘルプボタン押下時に `OnConfigurationDialogHelp` SHIORIイベント (Reference0: "settings") を送信するイベントハンドラを実装 (`ui/js/ui/modal-settings-handlers.js` -> `OnConfigurationDialogHelp`)。

## 実装箇所

- `ui/js/ghost/shiori-notify.js:25` `* - OnConfigurationDialogHelp, OnGhostTermsAccept, OnGhostTermsDecline, OnSystem`
- `ui/js/ui/modal-settings-handlers.js:91` `this.app.ghostController?.sendShioriEvent("OnConfigurationDialogHelp", [`
