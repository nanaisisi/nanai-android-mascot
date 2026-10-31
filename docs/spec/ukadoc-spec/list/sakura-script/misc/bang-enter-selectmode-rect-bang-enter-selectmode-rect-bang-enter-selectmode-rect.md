# \![enter,selectmode,モード(rect),左,上,右,下]\![enter,selectmode,モード(rect),当たり判定名]\![enter,selectmode,モード(rect)]

- **規格**: [bang-enter-selectmode-rect-bang-enter-selectmode-rect-bang-enter-selectmode-rect.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/misc/bang-enter-selectmode-rect-bang-enter-selectmode-rect-bang-enter-selectmode-rect/) (ukadoc-spec/list/sakura-script/misc/bang-enter-selectmode-rect-bang-enter-selectmode-rect-bang-enter-selectmode-rect.md)
- **検索語**: \!
- **対応状況**: ❌ 未実装

## 突合結果

パーサがタグを読み飛ばす、または sakura-command-handler.js が「未対応の \! コマンド」として扱い、該当処理はない。

## 実装箇所

- `src-tauri/src/commands/calendar.rs:2` `//! [calendar/index.md], [calendar/schedule.md], [calendar/menu.md], [\![open,ca`
- `crates/ui/src/lib.rs:81` `let script = r"\0\_q\x\_a[anchor01]リンク\_a\![raise,OnTest,1,2]\![bind,clothing,ri`
- `crates/ui/src/lib.rs:200` `let script = r"\0\![open,inputbox,--timeout=5]\![set,str,hello]\j[1,2]\__w[500]あ`
- `crates/ui/src/script/command.rs:41` `}, // \![raise,Event,...]`
- `crates/ui/src/script/command.rs:46` `}, // \![bind,cat,part,status]`
