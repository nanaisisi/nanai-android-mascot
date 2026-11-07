# OnGhostChanged

- **規格**: [OnGhostChanged.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-event/boot-close-change/OnGhostChanged/) (ukadoc-spec/list/shiori-event/boot-close-change/OnGhostChanged.md)
- **検索語**: OnGhostChanged
- **対応状況**: ✅ 実装済

## 突合結果

OnGhostChanged SHIORIイベント送信処理を実装 (ui/js/ghost/shiori-notify.js -> sendShioriNotify)。

## 実装箇所

- `ui/ts/ghost/shiori-notify.ts:624` `return await this.sendShioriNotify("OnGhostChanged", [toGhost, fromGhost]);`
- `ui/ts/ghost/command-handler/ghost.ts:36` `await gc.sendShioriEvent("OnGhostChanged", [name, fromGhost]);`
