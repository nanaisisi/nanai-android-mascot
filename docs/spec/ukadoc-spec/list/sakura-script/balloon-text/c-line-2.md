# \c[line,数値,開始位置]

- **規格**: [c-line-2.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/balloon-text/c-line-2/) (ukadoc-spec/list/sakura-script/balloon-text/c-line-2.md)
- **検索語**: \c
- **対応状況**: ⚠️ 一部対応

## 突合結果

`\c[line,N,pos]` 行クリアタグのパース処理を実装 (`crates/ui/src/script/parser/mod.rs`)。


## 実装箇所

- `crates/nanai-core/src/sakura_player.rs:20` `/// バルーンクリア (\c / \C)`
- `crates/nanai-core/src/sakura_player.rs:267` `let script = "\\__v[speech.wav]\\c\\C\\e";`
- `crates/nanai-core/src/sakura_script/tests.rs:105` `// \__v and \C / \c`
- `crates/nanai-core/src/sakura_script/tests.rs:106` `let script_vc = "\\__v[voice.wav]\\cHello\\CWorld";`
- `crates/nanai-core/src/sakura_script/types.rs:191` `/// 画面クリア (\c: reset, \C: keep settings)`
