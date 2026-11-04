# OnDeviceRemove

- **規格**: [OnDeviceRemove.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-event/os-state/OnDeviceRemove/) (ukadoc-spec/list/shiori-event/os-state/OnDeviceRemove.md)
- **検索語**: OnDeviceRemove
- **対応状況**: ✅ 実装済

## 突合結果

実装コードに「OnDeviceRemove」が見つからない。


## 実装箇所

- `ui/js/ghost/shiori-notify.js:23` `* - OnScreenSaverStart, OnScreenSaverEnd, OnDeviceArrival, OnDeviceRemove`
- `ui/js/ghost/shiori-notify.js:248` `* デバイス着脱通知 (OnDeviceArrival, OnDeviceRemove)`
- `ui/js/ghost/shiori-notify.js:254` `const event = action === "arrival" ? "OnDeviceArrival" : "OnDeviceRemove";`
