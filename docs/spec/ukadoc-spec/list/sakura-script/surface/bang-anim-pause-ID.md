# \![anim,pause,ID]

- **規格**: [bang-anim-pause-ID.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/surface/bang-anim-pause-ID/) (ukadoc-spec/list/sakura-script/surface/bang-anim-pause-ID.md)
- **検索語**: \!
- **対応状況**: ✅ 実装済 (SSP「pouse」表記ゆれ受付)

## 突合結果

`ui/js/ghost/sakura-command-handler.js` が `\![anim,pause,ID]` を処理し、
指定 ID のサーフィスアニメーション (SERIKO パターン再生) を一時停止する。
`\s[ID]` 実行時（SurfaceAnimationManager.stopAnimations 経由）に解除。
定義例の「pouse」タイポ表記も受付。

## 実装箇所

- `src-tauri/src/commands/calendar.rs:2` `//! [calendar/index.md], [calendar/schedule.md], [calendar/menu.md], [\![open,ca`
- `crates/ui/src/lib.rs:81` `let script = r"\0\_q\x\_a[anchor01]リンク\_a\![raise,OnTest,1,2]\![bind,clothing,ri`
- `crates/ui/src/lib.rs:200` `let script = r"\0\![open,inputbox,--timeout=5]\![set,str,hello]\j[1,2]\__w[500]あ`
- `crates/ui/src/script/command.rs:44` `}, // \![raise,Event,...]`
- `crates/ui/src/script/command.rs:49` `}, // \![bind,cat,part,status]`
