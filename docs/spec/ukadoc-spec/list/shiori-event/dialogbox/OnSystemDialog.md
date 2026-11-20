# OnSystemDialog

- **規格**: [OnSystemDialog.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-event/dialogbox/OnSystemDialog/) (ukadoc-spec/list/shiori-event/dialogbox/OnSystemDialog.md)
- **検索語**: OnSystemDialog
- **対応状況**: ✅ 実装済

## 突合結果

システムダイアログ（ファイル選択・カラー選択・フォルダ選択ダイアログ等）の決定時に `OnSystemDialog` SHIORIイベントを送信する処理を実装 (`ui/ts/ui/renderers/modal-dialog-system.ts` -> `OnSystemDialog`)。

## 実装箇所

- `ui/ts/ghost/shiori-protocol.ts:162` `SYSTEM_DIALOG: "OnSystemDialog"`
- `ui/ts/ghost/command-handler/inputbox.ts:96` `handler.app.ghostController?.sendShioriEvent("OnSystemDialog", [id, val]);`
- `ui/ts/ui/renderers/modal-dialog-system.ts:88` `await this.app?.ghostController?.sendShioriEvent?.("OnSystemDialog", [`
