# OnTeach

- **規格**: [OnTeach.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-event/inputbox/OnTeach/) (ukadoc-spec/list/shiori-event/inputbox/OnTeach.md)
- **検索語**: OnTeach
- **対応状況**: ✅ 実装済

## 突合結果

実装コードに「OnTeach」が見つからない。

## 実装箇所

- `crates/ui/src/shiori/protocol/response/mod.rs:75` `/// OnTeach の追加情報要求（311 Not Enough / 312 Advice）か`
- `crates/ui/src/shiori/types/code.rs:13` `/// 311 (OnTeach): 追加情報取得が必要（入力ボックス再オープン）`
- `crates/ui/src/shiori/types/code.rs:15` `/// 312 (OnTeach): 直近の Reference を破棄し再問合せ`
- `ui/js/ghost/ghost-shiori.js:162` `// TeachBox を再オープンして OnTeach ループへ`
- `ui/js/ghost/ghost-shiori.js:180` `* TeachBox 入力の送信（OnTeach + 311/312 再入ループ, UKADOC準拠）`
