# OnVirtualDesktopChanged

- **規格**: [OnVirtualDesktopChanged.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-event/boot-close-change/OnVirtualDesktopChanged/) (ukadoc-spec/list/shiori-event/boot-close-change/OnVirtualDesktopChanged.md)
- **検索語**: OnVirtualDesktopChanged
- **対応状況**: ✅ 実装済

## 突合結果

OnVirtualDesktopChanged SHIORIイベント送信処理を実装 (ui/js/ghost/shiori-notify.js -> sendShioriNotify)。

## 実装箇所

- `ui/ts/ghost/shiori-notify.ts:676` `return await this.sendShioriNotify("OnVirtualDesktopChanged", [String(desktopId)`
