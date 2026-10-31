# \![set,balloonnum,ファイル名,現在の数,最大数]

- **規格**: [bang-set-balloonnum.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/balloon-text/bang-set-balloonnum/) (ukadoc-spec/list/sakura-script/balloon-text/bang-set-balloonnum.md)
- **検索語**: \!
- **対応状況**: ✅ 実装済

## 突合結果

`\![set,balloonnum,...]` 設定コマンドのパース処理および `SakuraCommand::BalloonSetting` へのマッピングを実装 (`crates/ui/src/script/parser/brackets/handlers/raiselike.rs`)。

## 実装箇所

- `src-tauri/src/commands/calendar.rs:2` `//! [calendar/index.md], [calendar/schedule.md], [calendar/menu.md], [\![open,ca`
- `crates/ui/src/lib.rs:81` `let script = r"\0\_q\x\_a[anchor01]リンク\_a\![raise,OnTest,1,2]\![bind,clothing,ri`
- `crates/ui/src/lib.rs:200` `let script = r"\0\![open,inputbox,--timeout=5]\![set,str,hello]\j[1,2]\__w[500]あ`
- `crates/ui/src/script/command.rs:43` `}, // \![raise,Event,...]`
- `crates/ui/src/script/command.rs:48` `}, // \![bind,cat,part,status]`
