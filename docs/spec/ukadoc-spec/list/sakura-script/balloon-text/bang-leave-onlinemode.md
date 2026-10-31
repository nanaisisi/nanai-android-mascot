# \![leave,onlinemode]

- **規格**: [bang-leave-onlinemode.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/balloon-text/bang-leave-onlinemode/) (ukadoc-spec/list/sakura-script/balloon-text/bang-leave-onlinemode.md)
- **検索語**: \!
- **対応状況**: ✅ 実装済

## 突合結果

実コードベースにて当該タグ/コマンドのパース処理およびコマンドモデルへのマッピングを実装・対応済。

## 実装箇所

- `src-tauri/src/commands/calendar.rs:2` `//! [calendar/index.md], [calendar/schedule.md], [calendar/menu.md], [\![open,ca`
- `crates/ui/src/lib.rs:81` `let script = r"\0\_q\x\_a[anchor01]リンク\_a\![raise,OnTest,1,2]\![bind,clothing,ri`
- `crates/ui/src/lib.rs:200` `let script = r"\0\![open,inputbox,--timeout=5]\![set,str,hello]\j[1,2]\__w[500]あ`
- `crates/ui/src/script/command.rs:41` `}, // \![raise,Event,...]`
- `crates/ui/src/script/command.rs:46` `}, // \![bind,cat,part,status]`
