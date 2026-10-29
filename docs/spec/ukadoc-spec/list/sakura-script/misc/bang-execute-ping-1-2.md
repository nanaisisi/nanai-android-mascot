# \![execute,ping,パラメータ1,パラメータ2,...]

- **規格**: [bang-execute-ping-1-2.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/misc/bang-execute-ping-1-2/) (ukadoc-spec/list/sakura-script/misc/bang-execute-ping-1-2.md)
- **検索語**: \!
- **対応状況**: ❌ 未実装

## 突合結果

パーサがタグを読み飛ばす、または sakura-command-handler.js が「未対応の \! コマンド」として扱い、該当処理はない。


## 実装箇所

- `crates/ui/src/lib.rs:79` `let script = r"\0\_q\x\_a[anchor01]リンク\_a\![raise,OnTest,1,2]\![bind,clothing,ri`
- `crates/ui/src/lib.rs:198` `let script = r"\0\![open,inputbox,--timeout=5]\![set,str,hello]\j[1,2]\__w[500]あ`
- `crates/ui/src/script/command.rs:27` `}, // \![raise,Event,...]`
- `crates/ui/src/script/command.rs:32` `}, // \![bind,cat,part,status]`
- `crates/ui/src/script/command.rs:53` `}, // その他の \![...] 汎用透過`
