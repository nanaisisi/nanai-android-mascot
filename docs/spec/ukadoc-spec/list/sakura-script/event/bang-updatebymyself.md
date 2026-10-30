# \![updatebymyself(,オプション,オプション...)]

- **規格**: [bang-updatebymyself.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/event/bang-updatebymyself/) (ukadoc-spec/list/sakura-script/event/bang-updatebymyself.md)
- **検索語**: \!
- **対応状況**: ⚠️ 一部対応

## 突合結果

sakura-command-handler.js が updatebymyself を受け付け、ネットワーク更新を開始する (オプションは未解釈)。


## 実装箇所

- `crates/ui/src/lib.rs:78` `let script = r"\0\_q\x\_a[anchor01]リンク\_a\![raise,OnTest,1,2]\![bind,clothing,ri`
- `crates/ui/src/lib.rs:197` `let script = r"\0\![open,inputbox,--timeout=5]\![set,str,hello]\j[1,2]\__w[500]あ`
- `crates/ui/src/script/command.rs:27` `}, // \![raise,Event,...]`
- `crates/ui/src/script/command.rs:32` `}, // \![bind,cat,part,status]`
- `crates/ui/src/script/command.rs:53` `}, // その他の \![...] 汎用透過`
