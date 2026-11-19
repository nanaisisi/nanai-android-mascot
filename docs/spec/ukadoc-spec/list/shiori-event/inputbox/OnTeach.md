# OnTeach

- **規格**: [OnTeach.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-event/inputbox/OnTeach/) (ukadoc-spec/list/shiori-event/inputbox/OnTeach.md)
- **検索語**: OnTeach
- **対応状況**: ✅ 実装済

## 突合結果

ティーチボックス送信時に `OnTeach` SHIORIイベントおよび 311/312 再入ループ処理を実装 (`ui/ts/ghost/ghost-shiori.ts` -> `OnTeach`)。

## 実装箇所

- `crates/nanai-core/src/shiori_protocol_helpers/events/input.rs:134` `pub fn build_on_teach_request`
- `crates/ui/src/shiori/types/code.rs:13` `/// 311 (OnTeach): 追加情報取得が必要（入力ボックス再オープン）`
- `ui/ts/ghost/ghost-shiori.ts:265` `const resObj = await this.sendShioriEvent("OnTeach", [input]);`
