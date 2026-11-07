# OnOtherGhostClosed

- **規格**: [OnOtherGhostClosed.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-event/boot-close-change/OnOtherGhostClosed/) (ukadoc-spec/list/shiori-event/boot-close-change/OnOtherGhostClosed.md)
- **検索語**: OnOtherGhostClosed
- **対応状況**: ✅ 実装済

## 突合結果

OnOtherGhostClosed SHIORIイベント送信処理を実装 (ui/js/ghost/shiori-notify.js -> sendShioriNotify)。

## 実装箇所

- `ui/ts/ghost/shiori-notify.ts:656` `return await this.sendShioriNotify("OnOtherGhostClosed", [ghostName]);`
