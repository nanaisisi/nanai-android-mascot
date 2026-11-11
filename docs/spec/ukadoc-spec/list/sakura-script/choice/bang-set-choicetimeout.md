# \![set,choicetimeout,時間]

- **規格**: [bang-set-choicetimeout.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/choice/bang-set-choicetimeout/) (ukadoc-spec/list/sakura-script/choice/bang-set-choicetimeout.md)
- **検索語**: \!
- **対応状況**: ⚠️ 一部対応

## 突合結果

`\![set,choicetimeout,N]` タイムアウト設定コマンドのパースおよび `SakuraCommand::ChoiceTimeout` へのマッピングを実装 (`crates/ui/src/script/parser/brackets/handlers/raiselike.rs`)。

## 実装箇所

- `src-tauri/src/commands/calendar.rs:2` `//! [calendar/index.md], [calendar/schedule.md], [calendar/menu.md], [\![open,ca`
- `src-tauri/src/commands/shiori/lifecycle/load.rs:130` `/// ゴーストの SHIORI を再読み込み (`\![reload,shiori]` 対応)`
- `crates/ui/src/animation/scheduler/events.rs:24` `/// X方向動的オフセット (\![anim,offset,ID,x,y])`
- `crates/ui/src/animation/scheduler/events.rs:27` `/// Y方向動的オフセット (\![anim,offset,ID,x,y])`
- `crates/ui/src/animation/scheduler/state.rs:125` `/// 指定アニメーションを単独で停止 (\![anim,stop,ID] / \![anim,clear,ID])`
