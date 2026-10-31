# \![set,alignmentondesktop,bottomまたはtop]

- **規格**: [bang-set-alignmentondesktop-bottom-top.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/surface/bang-set-alignmentondesktop-bottom-top/) (ukadoc-spec/list/sakura-script/surface/bang-set-alignmentondesktop-bottom-top.md)
- **検索語**: \!
- **対応状況**: ⚠️ 一部対応

## 突合結果

sakura-command-handler.js は alignmenttodesktop を処理する。alignmentondesktop (旧名) の別名扱いは未確認。

## 実装箇所

- `src-tauri/src/commands/calendar.rs:2` `//! [calendar/index.md], [calendar/schedule.md], [calendar/menu.md], [\![open,ca`
- `crates/ui/src/lib.rs:81` `let script = r"\0\_q\x\_a[anchor01]リンク\_a\![raise,OnTest,1,2]\![bind,clothing,ri`
- `crates/ui/src/lib.rs:200` `let script = r"\0\![open,inputbox,--timeout=5]\![set,str,hello]\j[1,2]\__w[500]あ`
- `crates/ui/src/script/command.rs:37` `}, // \![raise,Event,...]`
- `crates/ui/src/script/command.rs:42` `}, // \![bind,cat,part,status]`
