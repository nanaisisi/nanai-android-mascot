# OnDressupChanged

- **規格**: [OnDressupChanged.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-event/boot-close-change/OnDressupChanged/) (ukadoc-spec/list/shiori-event/boot-close-change/OnDressupChanged.md)
- **検索語**: OnDressupChanged
- **対応状況**: ✅ 実装済(SHIORIへ送信)

## 突合結果

UI/Rust 側から sendShioriEvent 等でイベントを送信している(実装箇所を参照)。

## 実装箇所

- `ui/js/surface/surface.js:226` `await this.app.ghostController.sendShioriEvent("OnDressupChanged", [`
- `ui/js/core/app-actions.js` `handleDressupToggle` (着せ替えメニューからの切替時も OnDressupChanged 送出: Reference0=category, Reference1=part, Reference2=0/1, Reference3=scopeId)
- `ui/js/ghost/sakura-command-handler.js` `\![bind,...] / \![bind-noevent,...] からの切替時`
