# OnTeach

- **規格**: [OnTeach.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-event/inputbox/OnTeach/) (ukadoc-spec/list/shiori-event/inputbox/OnTeach.md)
- **検索語**: OnTeach
- **対応状況**: ✅ 実装済

## 突合結果

実装コードに「OnTeach」が見つからない。

## 実装箇所

- `ui/js/ghost/sakura-command-handler.js` （`\![open,teachbox]` / `\![close,teachbox]`: TeachBox UI、OnTeachStart 送出、OnTeachInputCancel (Reference0=空席/Reference1=cancel) ）
- `ui/js/ghost/ghost-shiori.js` （OnTeach + 311 Not Enough / 312 Advice 再入ループ: sendTeachInput / clearTeachHistory、入力履歴 Reference0.. 送信）
- `crates/ui/src/shiori.rs` （ShioriResponse::is_teach_pending: 311/312 判定）
