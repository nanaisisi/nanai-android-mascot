# \![open,inputbox,ID,表示時間,テキスト,オプション,...]

- **規格**: [bang-open-inputbox-ID.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/open/bang-open-inputbox-ID/) (ukadoc-spec/list/sakura-script/open/bang-open-inputbox-ID.md)
- **検索語**: \!
- **対応状況**: ✅ 実装済

## 突合結果

ui/js/ghost/sakura-parser.js / sakura-command-handler.js で処理: 入力ボックス表示 (ID/timeout/text/placeholder 対応)。

## 実装箇所

- `src-tauri/src/commands/calendar.rs:2` `//! [calendar/index.md], [calendar/schedule.md], [calendar/menu.md], [\![open,ca`
- `crates/ui/src/lib.rs:81` `let script = r"\0\_q\x\_a[anchor01]リンク\_a\![raise,OnTest,1,2]\![bind,clothing,ri`
- `crates/ui/src/lib.rs:200` `let script = r"\0\![open,inputbox,--timeout=5]\![set,str,hello]\j[1,2]\__w[500]あ`
- `crates/ui/src/script/command.rs:41` `}, // \![raise,Event,...]`
- `crates/ui/src/script/command.rs:46` `}, // \![bind,cat,part,status]`
