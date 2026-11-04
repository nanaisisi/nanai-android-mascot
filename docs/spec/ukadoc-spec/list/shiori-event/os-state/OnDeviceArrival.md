# OnDeviceArrival

- **規格**: [OnDeviceArrival.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-event/os-state/OnDeviceArrival/) (ukadoc-spec/list/shiori-event/os-state/OnDeviceArrival.md)
- **検索語**: OnDeviceArrival
- **対応状況**: ✅ 実装済

## 突合結果

実装コードに「OnDeviceArrival」が見つからない。


## 実装箇所

- `ui/js/ghost/shiori-notify.js:23` `* - OnScreenSaverStart, OnScreenSaverEnd, OnDeviceArrival, OnDeviceRemove`
- `ui/js/ghost/shiori-notify.js:248` `* デバイス着脱通知 (OnDeviceArrival, OnDeviceRemove)`
- `ui/js/ghost/shiori-notify.js:254` `const event = action === "arrival" ? "OnDeviceArrival" : "OnDeviceRemove";`
