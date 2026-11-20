# \_l[x,y]

- **規格**: [_l-x-y.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/balloon-text/l-x-y/) (ukadoc-spec/spec/ukadoc-spec/list/sakura-script/balloon-text/_l-x-y.md)
- **検索語**: \_l
- **対応状況**: ⚠️ 一部対応

## 突合結果

`\_l[x,y]` (Offset) タグのパース処理および `SakuraCommand::Offset` マッピングを実装 (`crates/ui/src/script/parser/brackets/handlers/underscore.rs`)。


## 実装箇所

- `crates/ui/src/script/command.rs:88` `}, // \_l[x,y] (座標移動)`
- `crates/ui/src/script/parser/executor.rs:58` `// \_w / \_q / \_a / \_s / \_l / \_! / \_\_v / \_\_q`
- `crates/ui/src/script/parser/tests.rs:101` `\\_l[100,200]\`
- `crates/ui/src/script/parser/brackets/handlers/underscore/handlers.rs:1` `//! アンダースコア接頭辞（\\_w, \\_q, \\_?, \\_a, \\_s, \\_m, \\_u, \\_l, \\__c, \\__q 等）コマ`
- `crates/ui/src/tests/sakura_script.rs:82` `let script = r"\b[0]\b[-1]\t\-\_s\_l[10,20]\f[color,red]\f[bold]";`
