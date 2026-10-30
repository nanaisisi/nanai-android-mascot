# \![set,alignmenttodesktop,free]

- **規格**: [bang-set-alignmenttodesktop-free.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/surface/bang-set-alignmenttodesktop-free/) (ukadoc-spec/list/sakura-script/surface/bang-set-alignmenttodesktop-free.md)
- **検索語**: \!
- **対応状況**: ✅ 実装済

## 突合結果

ui/js/ghost/sakura-parser.js / sakura-command-handler.js で処理: デスクトップ端寄せ。


## 実装箇所

- `src-tauri/src/commands/calendar.rs:2` `//! [calendar/index.md], [calendar/schedule.md], [calendar/menu.md], [\![open,ca`
- `crates/ui/src/lib.rs:81` `let script = r"\0\_q\x\_a[anchor01]リンク\_a\![raise,OnTest,1,2]\![bind,clothing,ri`
- `crates/ui/src/lib.rs:200` `let script = r"\0\![open,inputbox,--timeout=5]\![set,str,hello]\j[1,2]\__w[500]あ`
- `crates/ui/src/script/command.rs:27` `}, // \![raise,Event,...]`
- `crates/ui/src/script/command.rs:32` `}, // \![bind,cat,part,status]`
