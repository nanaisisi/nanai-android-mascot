# \_l[x,y]

- **規格**: [_l-x-y.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/balloon-text/l-x-y/) (ukadoc-spec/spec/ukadoc-spec/list/sakura-script/balloon-text/_l-x-y.md)
- **検索語**: \_l
- **対応状況**: ✅ 実装済

## 突合結果

`\_l[x,y]` (Offset) タグのパース処理および `SakuraCommand::Offset` マッピングを実装 (`crates/ui/src/script/parser/brackets/handlers/underscore.rs`)。


## 実装箇所

- `crates/ui/src/lib.rs:114` `let script = r"\b[0]\b[-1]\t\-\_s\_l[10,20]\f[color,red]\f[bold]";`
- `crates/ui/src/script/command.rs:64` `}, // \_l[x,y] (座標移動)`
- `crates/ui/src/script/parser/mod.rs:49` `// \_w / \_q / \_a / \_s / \_l`
- `ui/js/ghost/sakura-tokenizer.js:214` `// \_l[x,y] (座標移動)`
- `tests/sakura-tokenizer.test.js:10` `"\\0\\hHello\\1\\uWorld\\p[2]\\p0\\s[10]\\s0\\i[1,wait]\\i2\\w5\\_w[200]\\n\\n[h`
