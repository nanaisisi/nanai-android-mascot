# OnNotifyOSInfo

- **規格**: [OnNotifyOSInfo.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-event/notify/OnNotifyOSInfo/) (ukadoc-spec/list/shiori-event/notify/OnNotifyOSInfo.md)
- **検索語**: OnNotifyOSInfo
- **対応状況**: ✅ 実装済

## 突合結果

実装コードに「OnNotifyOSInfo」が見つからない。


## 実装箇所

- `ui/js/ghost/shiori-notify.js:16` `* - OnNotifyOSInfo, OnNotifySelfInfo, OnNotifyBalloonInfo`
- `ui/js/ghost/shiori-notify.js:66` `* OS情報通知 (OnNotifyOSInfo) を送信 (UKADOC 規格準拠)`
- `ui/js/ghost/shiori-notify.js:72` `return await this.sendShioriNotify("OnNotifyOSInfo", [osName, osVersion]);`
