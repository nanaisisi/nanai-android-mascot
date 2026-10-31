# \_b[ファイルパス,x,y]

- **規格**: [_b-x-y.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/balloon-text/_b-x-y/)
- **検索語**: \_b
- **対応状況**: ✅ 実装済

## 突合結果

`\_b[path,x,y]` (InlineBitmap) 座標指定付きタグのパース処理を実装。


## 実装箇所

- `crates/ui/src/script/command.rs:23` `}, // \_b[...]`
- `crates/ui/src/script/parser/brackets/mod.rs:182` `"a[id]text\\_b\\_a",`
