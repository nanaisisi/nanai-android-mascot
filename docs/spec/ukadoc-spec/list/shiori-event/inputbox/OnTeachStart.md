# OnTeachStart

- **規格**: [OnTeachStart.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-event/inputbox/OnTeachStart/) (ukadoc-spec/list/shiori-event/inputbox/OnTeachStart.md)
- **検索語**: OnTeachStart
- **対応状況**: ✅ 実装済

## 突合結果

実装コードに「OnTeachStart」が見つからない。

## 実装箇所

- `ui/js/ghost/sakura-command-handler.js:23` `// \![open,teachbox] — OnTeachStart → OnTeach / OnTeachInputCancel (UKADOC 準拠)`
- `ui/js/ghost/sakura-command-handler.js:219` `* オープン時に OnTeachStart を送出し、OK で OnTeach（入力履歴 Reference0..）、`
- `ui/js/ghost/sakura-command-handler.js:232` `this.app.ghostController?.sendShioriEvent("OnTeachStart").catch(() => {});`
