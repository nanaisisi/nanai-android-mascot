# \__v[オプション]

- **規格**: [__v.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/balloon-text/__v/)
- **検索語**: \__v
- **対応状況**: ⚠️ 一部対応

## 突合結果

`\__v[...]` (Voice) タグのパースおよびエンジン・フロントエンドにおける音声再生ルーティングを完全実装 (`crates/nanai-core/src/sakura_script/parser/extended_tags.rs` / `ui/ts/ghost/sakura-script.ts`)。


## 実装箇所

- `crates/nanai-core/src/sakura_player.rs:22` `/// 音声再生 (\__v[path])`
- `crates/nanai-core/src/sakura_player.rs:267` `let script = "\\__v[speech.wav]\\c\\C\\e";`
- `crates/nanai-core/src/sakura_script/tests.rs:105` `// \__v and \C / \c`
- `crates/nanai-core/src/sakura_script/tests.rs:106` `let script_vc = "\\__v[voice.wav]\\cHello\\CWorld";`
- `crates/nanai-core/src/sakura_script/types.rs:193` `/// 音声再生指定 (\__v[path])`
