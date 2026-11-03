# ヘッドラインセンスOnFindフェーズ

- **規格**: [caption_headlinesensephase.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-event/headline-rss/caption_headlinesensephase/) (ukadoc-spec/list/shiori-event/headline-rss/caption_headlinesensephase.md)
- **検索語**: OnFind
- **対応状況**: ✅ 実装済

## 突合結果

実装コードに「OnFind」が見つからない。


## 実装箇所

- `ui/js/ghost/shiori-notify.js:25` `* - OnHeadlinesenseBegin, OnHeadlinesense.OnFind, OnHeadlinesenseComplete, OnHea`
- `ui/js/ghost/shiori-notify.js:237` `* ヘッドライン発見通知 (OnHeadlinesense.OnFind)`
- `ui/js/ghost/shiori-notify.js:244` `async sendHeadlineSenseOnFind(siteName, url, phase, content) {`
- `ui/js/ghost/shiori-notify.js:245` `return await this.sendShioriNotify("OnHeadlinesense.OnFind", [`
