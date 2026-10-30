# \![anim,resume,ID]

- **規格**: [bang-anim-resume-ID.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/surface/bang-anim-resume-ID/) (ukadoc-spec/list/sakura-script/surface/bang-anim-resume-ID.md)
- **検索語**: \!
- **対応状況**: ✅ 実装済

## 突合結果

`ui/js/ghost/sakura-command-handler.js` が `\![anim,resume,ID]` を処理し、
`\![anim,pause,ID]` (pouse 含む) で一時停止したサーフィスアニメーションを再開する。

## 実装箇所

- `src-tauri/src/commands/calendar.rs:2` `//! [calendar/index.md], [calendar/schedule.md], [calendar/menu.md], [\![open,ca`
- `crates/ui/src/lib.rs:81` `let script = r"\0\_q\x\_a[anchor01]リンク\_a\![raise,OnTest,1,2]\![bind,clothing,ri`
- `crates/ui/src/lib.rs:200` `let script = r"\0\![open,inputbox,--timeout=5]\![set,str,hello]\j[1,2]\__w[500]あ`
- `crates/ui/src/script/command.rs:27` `}, // \![raise,Event,...]`
- `crates/ui/src/script/command.rs:32` `}, // \![bind,cat,part,status]`
