# \![lock,repaint]

- **規格**: [bang-lock-repaint.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/surface/bang-lock-repaint/) (ukadoc-spec/list/sakura-script/surface/bang-lock-repaint.md)
- **検索語**: LockBalloonRepaint
- **対応状況**: ⚠️ 一部対応

## 突合結果

\\![lock,repaint] / \\![unlock,repaint] 描画ロック制御タグのパース処理を実装 (crates/ui/src/script/command.rs -> SakuraCommand::LockBalloonRepaint)。

## 実装箇所

- `crates/ui/src/script/command.rs:71` `LockBalloonRepaint(bool),`
- `ui/ts/ghost/sakura-rust-bridge.ts:115` `| { type: "LockBalloonRepaint"; payload?: boolean }`
- `crates/ui/src/script/command.rs:198` `| SakuraCommand::LockBalloonRepaint(_)`
- `ui/ts/ghost/sakura-rust-bridge.ts:424` `case "LockBalloonRepaint":`
- `crates/ui/src/script/ast/tests/ast_inspection/walk_collect.rs:84` `SakuraCommand::LockBalloonRepaint(true),`
- `crates/ui/src/script/parser/brackets/handlers/raiselike/settings/handlers.rs:113` `callback(SakuraCommand::LockBalloonRepaint(parts[0] == "lock"));`
