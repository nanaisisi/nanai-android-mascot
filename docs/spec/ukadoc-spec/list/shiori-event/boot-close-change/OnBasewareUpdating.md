# OnBasewareUpdating

- **規格**: [OnBasewareUpdating.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-event/boot-close-change/OnBasewareUpdating/) (ukadoc-spec/list/shiori-event/boot-close-change/OnBasewareUpdating.md)
- **検索語**: sendShioriNotify
- **対応状況**: ✅ 実装済

## 突合結果

OnBasewareUpdating イベント通知・SHIORI送信処理を実装 (ui/js/ghost/shiori-notify.js -> sendShioriNotify)。

## 実装箇所

- `ui/js/ghost/shiori-notify.js:24` `async sendShioriNotify(event, references) {`
- `ui/js/ghost/shiori-notify.js:53` `await this.sendShioriNotify(`
- `ui/js/ghost/shiori-notify.js:57` `await this.sendShioriNotify(`
- `ui/js/ghost/shiori-notify.js:66` `await this.sendShioriNotify("installedkeroname", keroNames);`
- `ui/js/ghost/shiori-notify.js:71` `await this.sendShioriNotify("installedshellname", this.shells);`
