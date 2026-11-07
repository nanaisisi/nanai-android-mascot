# OnGhostCalling

- **規格**: [OnGhostCalling.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-event/boot-close-change/OnGhostCalling/) (ukadoc-spec/list/shiori-event/boot-close-change/OnGhostCalling.md)
- **検索語**: OnGhostCalling
- **対応状況**: ✅ 実装済

## 突合結果

OnGhostCalling SHIORIイベント送信処理を実装 (ui/js/ghost/shiori-notify.js -> sendShioriNotify)。

## 実装箇所

- `ui/ts/ghost/shiori-notify.ts:636` `return await this.sendShioriNotify("OnGhostCalling", [targetGhost]);`
