# OnBalloonScaling

- **規格**: [OnBalloonScaling.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-event/other/OnBalloonScaling/) (ukadoc-spec/list/shiori-event/other/OnBalloonScaling.md)
- **検索語**: OnBalloonScaling
- **対応状況**: ✅ 実装済

## 突合結果

実装コードに「OnBalloonScaling」が見つからない。


## 実装箇所

- `ui/js/ghost/shiori-notify.js:15` `* - OnBalloonBreak, OnBalloonClose, OnBalloonTimeout, OnBalloonScaling (バルーン操作イベ`
- `ui/js/ghost/shiori-notify.js:146` `* バルーン倍率変更通知 (OnBalloonScaling) を送信 (UKADOC準拠)`
- `ui/js/ghost/shiori-notify.js:159` `return await this.sendShioriNotify("OnBalloonScaling", [`
- `ui/js/core/actions/balloon-theme.js:170` `// UKADOC準拠: OnBalloonScaling SHIORIイベント送信 (Reference0: afterX, Reference1: befo`
- `ui/js/core/actions/balloon-theme.js:181` `void gc.sendShioriEvent("OnBalloonScaling", [`
