# OnTeachInputCancel

- **規格**: [OnTeachInputCancel.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-event/inputbox/OnTeachInputCancel/) (ukadoc-spec/list/shiori-event/inputbox/OnTeachInputCancel.md)
- **検索語**: OnTeachInputCancel
- **対応状況**: ✅ 実装済

## 突合結果

実装コードに「OnTeachInputCancel」が見つからない。

## 実装箇所

- `ui/js/ghost/sakura-command-handler.js:23` `// \![open,teachbox] — OnTeachStart → OnTeach / OnTeachInputCancel (UKADOC 準拠)`
- `ui/js/ghost/sakura-command-handler.js:26` `// \![close,teachbox] — OnTeachInputCancel を発生させない`
- `ui/js/ghost/sakura-command-handler.js:220` `* 閉じる/キャンセルで OnTeachInputCancel（Reference0=空席, Reference1=cancel）。`
- `ui/js/ghost/sakura-command-handler.js:288` `await this.app.ghostController?.sendShioriEvent("OnTeachInputCancel", [`
- `ui/js/ghost/sakura-command-handler.js:319` `* OnTeachInputCancel を発生させずに閉じる。開いてない場合は無視される。`
