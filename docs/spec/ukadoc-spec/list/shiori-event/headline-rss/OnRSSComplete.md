# OnRSSComplete

- **規格**: [OnRSSComplete.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-event/headline-rss/OnRSSComplete/) (ukadoc-spec/list/shiori-event/headline-rss/OnRSSComplete.md)
- **検索語**: OnRSSComplete
- **対応状況**: ✅ 実装済

## 突合結果

実装コードに「OnRSSComplete」が見つからない。


## 実装箇所

- `ui/js/ghost/shiori-notify.js:26` `* - OnRSSBegin, OnRSSComplete, OnRSSFailure`
- `ui/js/ghost/shiori-notify.js:282` `* RSSセンス完了通知 (OnRSSComplete)`
- `ui/js/ghost/shiori-notify.js:290` `return await this.sendShioriNotify("OnRSSComplete", ["no update"]);`
- `ui/js/ghost/shiori-notify.js:292` `return await this.sendShioriNotify("OnRSSComplete", [`
