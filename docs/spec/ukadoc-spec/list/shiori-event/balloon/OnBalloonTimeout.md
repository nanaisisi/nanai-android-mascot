# OnBalloonTimeout

- **規格**: [OnBalloonTimeout.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-event/balloon/OnBalloonTimeout/) (ukadoc-spec/list/shiori-event/balloon/OnBalloonTimeout.md)
- **検索語**: OnBalloonTimeout
- **対応状況**: ⚠️ 一部対応

## 突合結果

`OnBalloonTimeout` (バルーンタイムアウト) SHIORIイベント送信処理を実装 (`ui/js/ghost/shiori-notify.js` -> `sendShioriNotify`).

## 実装箇所

- `crates/nanai-core/src/shiori_protocol_helpers/events/system.rs:67` `/// OnBalloonTimeout イベントリクエスト構築`
- `ui/ts/ghost/shiori-protocol.ts:145` `BALLOON_TIMEOUT: "OnBalloonTimeout",`
- `crates/nanai-core/src/shiori_protocol_helpers/events/system.rs:72` `event_id: "OnBalloonTimeout",`
- `ui/ts/ghost/shiori-notify/balloon-surface.ts:71` `* バルーンタイムアウト通知 (OnBalloonTimeout) を送信 (UKADOC準拠)`
- `crates/nanai-core/src/shiori_protocol_helpers/tests/events.rs:219` `assert!(balloon_timeout.contains("ID: OnBalloonTimeout"));`
- `ui/ts/ghost/shiori-notify/balloon-surface.ts:81` `return await this.sendShioriNotify("OnBalloonTimeout", [`
