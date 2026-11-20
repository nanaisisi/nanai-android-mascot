# OnTeachStart

- **規格**: [OnTeachStart.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-event/inputbox/OnTeachStart/) (ukadoc-spec/list/shiori-event/inputbox/OnTeachStart.md)
- **検索語**: OnTeachStart
- **対応状況**: ✅ 実装済

## 突合結果

ティーチボックス展開時に `OnTeachStart` SHIORIイベントを送信する処理を実装 (`ui/ts/ghost/command-handler/teachbox.ts` -> `OnTeachStart`)。

## 実装箇所

- `ui/ts/ghost/command-handler/teachbox.ts:17` `?.sendShioriEvent("OnTeachStart")`
- `ui/ts/ui/renderers/modal-dialog-communication.ts:24` `?.sendShioriEvent?.("OnTeachStart")`
