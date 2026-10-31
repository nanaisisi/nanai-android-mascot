# OnShellChanged

- **規格**: [OnShellChanged.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-event/boot-close-change/OnShellChanged/) (ukadoc-spec/list/shiori-event/boot-close-change/OnShellChanged.md)
- **検索語**: OnShellChanged
- **対応状況**: ✅ 実装済

## 突合結果

OnShellChanged SHIORIイベント送信処理を実装 (ui/js/ghost/shiori-notify.js -> sendShioriNotify)。

## 実装箇所

- `ui/js/ghost/ghost.js:256` `this.sendShioriEvent("OnShellChanged", [shellName]);`
- `ui/js/ghost/shiori-notify.js:19` `* - OnInitialize, OnOtherGhostBooted, OnOtherGhostChanged, OnOtherGhostClosed, O`
