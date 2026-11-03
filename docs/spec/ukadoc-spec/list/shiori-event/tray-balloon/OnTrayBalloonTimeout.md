# OnTrayBalloonTimeout

- **規格**: [OnTrayBalloonTimeout.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-event/tray-balloon/OnTrayBalloonTimeout/) (ukadoc-spec/list/shiori-event/tray-balloon/OnTrayBalloonTimeout.md)
- **検索語**: OnTrayBalloonTimeout
- **対応状況**: ✅ 実装済

## 突合結果

実装コードに「OnTrayBalloonTimeout」が見つからない。


## 実装箇所

- `ui/js/ghost/command-handler/system/desktop.js:74` `// UKADOCトレイバルーンイベント連携: OnTrayBalloonClick, OnTrayBalloonTimeout`
- `ui/js/ghost/command-handler/system/desktop.js:80` `?.sendShioriEvent?.("OnTrayBalloonTimeout", [title, text])`
