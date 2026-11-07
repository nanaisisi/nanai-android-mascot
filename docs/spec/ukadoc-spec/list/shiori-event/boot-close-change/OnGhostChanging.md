# OnGhostChanging

- **規格**: [OnGhostChanging.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-event/boot-close-change/OnGhostChanging/) (ukadoc-spec/list/shiori-event/boot-close-change/OnGhostChanging.md)
- **検索語**: OnGhostChanging
- **対応状況**: ✅ 実装済

## 突合結果

OnGhostChanging SHIORIイベント送信処理を実装 (ui/js/ghost/shiori-notify.js -> sendShioriNotify)。

## 実装箇所

- `ui/ts/ghost/shiori-notify.ts:620` `return await this.sendShioriNotify("OnGhostChanging", [toGhost, reason, fromGhos`
- `ui/ts/ghost/command-handler/ghost.ts:30` `await gc.sendShioriEvent("OnGhostChanging", [name, "manual", fromGhost]);`
