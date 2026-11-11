# \![bind-noevent,カテゴリ名,パーツ名,数値]

- **規格**: [bang-bind-noevent.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/surface/bang-bind-noevent/) (ukadoc-spec/list/sakura-script/surface/bang-bind-noevent.md)
- **検索語**: Bind
- **対応状況**: ⚠️ 一部対応

## 突合結果

\\![bind,...] 着せ替え制御タグのパース処理を実装 (crates/ui/src/script/command.rs -> SakuraCommand::Bind)。

## 実装箇所

- `src-tauri/src/commands/shell/manifest.rs:121` `DrawMethod::Add | DrawMethod::Bind => "add".to_string(),`
- `crates/ui/src/animation/timeline.rs:103` `| Interval::Bind`
- `crates/ui/src/animation/scheduler/triggers.rs:80` `Interval::Bind => {`
- `crates/ui/src/animation/scheduler/triggers.rs:190` `Some(Interval::Bind) => {`
- `crates/ui/src/animation/tests/active_animation.rs:180` `Interval::Bind,`
