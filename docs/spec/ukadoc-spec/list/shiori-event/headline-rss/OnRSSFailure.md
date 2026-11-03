# OnRSSFailure

- **規格**: [OnRSSFailure.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-event/headline-rss/OnRSSFailure/) (ukadoc-spec/list/shiori-event/headline-rss/OnRSSFailure.md)
- **検索語**: OnRSSFailure
- **対応状況**: ✅ 実装済

## 突合結果

実装コードに「OnRSSFailure」が見つからない。


## 実装箇所

- `ui/js/ghost/shiori-notify.js:26` `* - OnRSSBegin, OnRSSComplete, OnRSSFailure`
- `ui/js/ghost/shiori-notify.js:300` `* RSSセンス失敗通知 (OnRSSFailure)`
- `ui/js/ghost/shiori-notify.js:305` `return await this.sendShioriNotify("OnRSSFailure", [reason]);`
