# \![unlock,repaint]

- **規格**: [bang-unlock-repaint.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/surface/bang-unlock-repaint/) (ukadoc-spec/list/sakura-script/surface/bang-unlock-repaint.md)
- **検索語**: LockBalloonRepaint
- **対応状況**: ✅ 実装済

## 突合結果

\\![lock,repaint] / \\![unlock,repaint] 描画ロック制御タグのパース処理を実装 (crates/ui/src/script/command.rs -> SakuraCommand::LockBalloonRepaint)。

## 実装箇所

- `crates/ui/src/script/command.rs:61` `LockBalloonRepaint(bool),`
- `crates/ui/src/script/parser/brackets/handlers/raiselike.rs:188` `callback(SakuraCommand::LockBalloonRepaint(parts[0] == "lock"));`
