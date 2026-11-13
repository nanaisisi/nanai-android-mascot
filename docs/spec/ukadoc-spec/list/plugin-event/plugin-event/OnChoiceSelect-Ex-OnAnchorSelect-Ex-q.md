# OnChoiceSelect(Ex)/OnAnchorSelect(Ex)/\q等に指定された任意名イベント

- **規格**: [OnChoiceSelect-Ex-OnAnchorSelect-Ex-q.md](https://ukatech.shillest.net/ukadoc-spec/list/plugin-event/plugin-event/OnChoiceSelect-Ex-OnAnchorSelect-Ex-q/) (ukadoc-spec/list/plugin-event/plugin-event/OnChoiceSelect-Ex-OnAnchorSelect-Ex-q.md)
- **検索語**: OnChoiceSelect
- **対応状況**: ⚠️ 一部対応

## 突合結果

ヒットしたのは一般的な語「OnChoiceSelect」の無関係な出現。該当の仕様に対応する処理は確認できない。

## 実装箇所

- `crates/nanai-core/src/shiori_protocol.rs:123` `/// OnChoiceSelect イベントリクエスト構築`
- `crates/nanai-core/src/shiori_protocol.rs:126` `build_shiori_request_extended("GET", "OnChoiceSelect", &refs, None)`
- `crates/nanai-core/src/shiori_protocol.rs:228` `assert!(choice_req.contains("ID: OnChoiceSelect"));`
- `ui/ts/core/app-actions.ts:6` `* - OnChoiceSelect: リコメンド・ポータル等の選択イベント`
- `ui/ts/core/actions/menu-action-dispatcher.ts:8` `recommend: ["OnChoiceSelect", ["recommendlink"]],`
