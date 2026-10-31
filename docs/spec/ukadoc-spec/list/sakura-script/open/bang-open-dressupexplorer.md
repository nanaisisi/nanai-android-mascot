# \![open,dressupexplorer]

- **規格**: [bang-open-dressupexplorer.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/open/bang-open-dressupexplorer/) (ukadoc-spec/list/sakura-script/open/bang-open-dressupexplorer.md)
- **検索語**: \!
- **対応状況**: ✅ 実装済 (簡易実装: 着せ替えメニューを開く)

## 突合結果

`ui/js/ghost/sakura-command-handler.js` が `\![open,dressupexplorer]` を処理し、
着せ替え (bindgroup) サブメニューを含む標準メニューを開く。
SSP 本家のような専用エクスプローラーウィンドウは今後の拡張。

## 実装箇所

- `src-tauri/src/commands/calendar.rs:2` `//! [calendar/index.md], [calendar/schedule.md], [calendar/menu.md], [\![open,ca`
- `crates/ui/src/lib.rs:81` `let script = r"\0\_q\x\_a[anchor01]リンク\_a\![raise,OnTest,1,2]\![bind,clothing,ri`
- `crates/ui/src/lib.rs:200` `let script = r"\0\![open,inputbox,--timeout=5]\![set,str,hello]\j[1,2]\__w[500]あ`
- `crates/ui/src/script/command.rs:41` `}, // \![raise,Event,...]`
- `crates/ui/src/script/command.rs:46` `}, // \![bind,cat,part,status]`
