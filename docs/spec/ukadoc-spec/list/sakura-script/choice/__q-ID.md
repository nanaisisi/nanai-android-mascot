# \__q[ID,...]

- **規格**: [__q-ID.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/choice/__q-ID/) (ukadoc-spec/list/sakura-script/choice/__q-ID.md)
- **検索語**: \__q
- **対応状況**: ⚠️ 一部対応

## 突合結果

`\_\_q` (Quick) タグのパーサ処理を実装 (`crates/ui/src/script/parser/brackets/handlers/underscore.rs`)。

## 実装箇所

- `crates/nanai-core/src/sakura_script/tests.rs:92` `// \__q`
- `crates/nanai-core/src/sakura_script/tests.rs:93` `let script_q = "\\__q[OnChoice,arg1]Choice text\\__q";`
- `crates/nanai-core/src/sakura_script/types.rs:213` `/// 選択肢スコープ開始 (\__q[id,args...])`
- `crates/nanai-core/src/sakura_script/types.rs:215` `/// 選択肢スコープ終了 (\__q)`
- `crates/nanai-core/src/sakura_script/parser/extended_tags.rs:1` `//! 拡張さくらスクリプトタグ (\_w, \__q, \_u, \_m, \_s, \_q, \_n, \_?, \_!, \_a) パース処理`
