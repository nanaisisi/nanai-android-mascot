# OnBalloonBreak

- **規格**: [OnBalloonBreak.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-event/balloon/OnBalloonBreak/) (ukadoc-spec/list/shiori-event/balloon/OnBalloonBreak.md)
- **検索語**: sendShioriNotify
- **対応状況**: ✅ 実装済

## 突合結果

`OnBalloonBreak` バルーン中断SHIORIイベント送信処理を実装 (`ui/js/ghost/shiori-notify.js` -> `sendShioriNotify`, `crates/ui/src/script/command.rs` -> `SakuraCommand::Raise`)。

## 実装箇所

- `ui/js/ghost/shiori-notify.js:24` `async sendShioriNotify(event, references) {`
- `ui/js/ghost/shiori-notify.js:53` `await this.sendShioriNotify(`
- `ui/js/ghost/shiori-notify.js:57` `await this.sendShioriNotify(`
- `ui/js/ghost/shiori-notify.js:66` `await this.sendShioriNotify("installedkeroname", keroNames);`
- `ui/js/ghost/shiori-notify.js:71` `await this.sendShioriNotify("installedshellname", this.shells);`
