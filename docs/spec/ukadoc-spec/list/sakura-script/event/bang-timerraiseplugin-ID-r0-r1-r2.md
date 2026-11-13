# \![timerraiseplugin,時間,繰り返すか否か,プラグインのIDまたは名前,イベント名,r0,r1,r2...]

- **規格**: [bang-timerraiseplugin-ID-r0-r1-r2.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/event/bang-timerraiseplugin-ID-r0-r1-r2/) (ukadoc-spec/list/sakura-script/event/bang-timerraiseplugin-ID-r0-r1-r2.md)
- **検索語**: \!
- **対応状況**: ✅ 実装済

## 突合結果

パーサがタグを読み飛ばす、または sakura-command-handler.js が「未対応の \! コマンド」として扱い、該当処理はない。

## 実装箇所

- `crates/ui/src/animation/scheduler/events.rs:24` `/// X方向動的オフセット (\![anim,offset,ID,x,y])`
- `src-tauri/src/commands/calendar.rs:2` `//! [calendar/index.md], [calendar/schedule.md], [calendar/menu.md], [\![open,ca`
- `ui/ts/core/actions/update-protocol.ts:28` `* 定義: manual (手動), auto (定期/タイマー自動), script (さくらスクリプト \![update] による実行)`
- `ui/ts/ui/spec-compliance-runner.ts:712` `const specName = "\\![open,dialog,color] / terms UIフォーム & コールバック";`
- `tests/install-update-protocol.test.ts:67` `"\\![reload,plugin]",`
- `crates/ui/src/animation/scheduler/events.rs:27` `/// Y方向動的オフセット (\![anim,offset,ID,x,y])`
