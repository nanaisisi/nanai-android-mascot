# OnTeachInputCancel

- **規格**: [OnTeachInputCancel.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-event/inputbox/OnTeachInputCancel/) (ukadoc-spec/list/shiori-event/inputbox/OnTeachInputCancel.md)
- **検索語**: OnTeachInputCancel
- **対応状況**: ✅ 実装済

## 突合結果

実装コードに「OnTeachInputCancel」が見つからない。

## 実装箇所

- `ui/js/ghost/command-handler/teachbox.js:62` `await handler.app.ghostController?.sendShioriEvent("OnTeachInputCancel", [`
- `tests/sakura-command-handler.test.js:142` `assert.ok(eventsSent.some((e) => e.ev === "OnTeachInputCancel"));`
