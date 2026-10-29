# \i[ID番号]

- **規格**: [i-ID.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/surface/i-ID/) (ukadoc-spec/list/sakura-script/surface/i-ID.md)
- **検索語**: \i
- **対応状況**: ✅ 実装済

## 突合結果

ui/js/ghost/sakura-parser.js / sakura-command-handler.js で処理: アニメーション呼出。


## 実装箇所

- `crates/ui/src/lib.rs:187` `let script = r"\0\1は鳴き声\i[3,wait]\i7この間は本文";`
- `crates/ui/src/script/command.rs:37` `}, // \i[ID], \i[ID,wait]`
- `crates/ui/src/script/parser/brackets.rs:68` `/// `\i[ID]` / `\i[ID,wait]` / `\i0..\i9``
- `crates/ui/src/script/parser/brackets.rs:73` `// 旧形式 \i0..\i9`
- `crates/ui/src/script/parser/mod.rs:75` `// \i[ID] / \i[ID,wait] / \i0..\i9`
