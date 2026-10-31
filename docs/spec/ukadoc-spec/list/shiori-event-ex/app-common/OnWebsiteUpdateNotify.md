# OnWebsiteUpdateNotify

- **規格**: [OnWebsiteUpdateNotify.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-event-ex/app-common/OnWebsiteUpdateNotify/) (ukadoc-spec/list/shiori-event-ex/app-common/OnWebsiteUpdateNotify.md)
- **検索語**: notifyWebsiteUpdate
- **対応状況**: ✅ 実装済

## 突合結果

Webサイト更新通知時に `OnWebsiteUpdateNotify` SHIORIイベント（Reference0: URL, Reference1: 更新日時）を送信する通知処理を実装 (`ui/js/ghost/shiori-notify.js` -> `notifyWebsiteUpdate`)。

## 実装箇所

- `ui/js/ghost/shiori-notify.js:136` `async notifyWebsiteUpdate(url, updateTime = "") {`
