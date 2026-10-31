# OnFirstBoot

- **規格**: [OnFirstBoot.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-event/boot-close-change/OnFirstBoot/) (ukadoc-spec/list/shiori-event/boot-close-change/OnFirstBoot.md)
- **検索語**: OnFirstBoot
- **対応状況**: ✅ 実装済

## 突合結果

OnFirstBoot SHIORIイベント送信処理を実装 (ui/js/ghost/shiori-notify.js -> sendShioriNotify)。

## 実装箇所

- `crates/ui/src/shiori/protocol/request.rs:24` `/// 互換可能な基本イベント名（SSP拡張。`OnFirstBoot` → `OnBoot` など）`
- `ui/js/ghost/shiori-notify.js:17` `* - OnClose, OnCloseAll, OnDestroy, OnDressupChanged, OnFirstBoot, OnFullScreenA`
