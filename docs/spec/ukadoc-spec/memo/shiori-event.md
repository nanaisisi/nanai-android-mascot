# memo/shiori-event.md 規格対応文書

- **参照規格**: [ukadoc-spec/memo/shiori-event.md](../../../../ukadoc-spec/memo/shiori-event.md) (SHIORIイベント解説)
- **対応状況**: ✅ 対応済

## 突合結果

- SHIORI 3.0 / 2.x の GET / NOTIFY コマンド区別、Reference 配列処理、イベントディスパッチ機構の完全実装。

## 実装箇所

- `crates/ui/src/shiori/protocol/` SHIORI プロトコル・イベント処理
- `ui/js/ghost/shiori-notify.js` SHIORI イベント通知
