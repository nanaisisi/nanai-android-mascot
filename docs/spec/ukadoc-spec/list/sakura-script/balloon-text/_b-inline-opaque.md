# \_b[ファイルパス,inline,opaque]

- **規格**: [_b-inline-opaque.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/balloon-text/_b-inline-opaque/)
- **検索語**: \_b
- **対応状況**: ✅ 実装済

## 突合結果

`\_b[...]` (InlineBitmap) opaqueオプション付きタグのパース処理を実装。


## 実装箇所

- `crates/ui/src/script/command.rs:23` `}, // \_b[...]`
- `crates/ui/src/script/parser/brackets/mod.rs:182` `"a[id]text\\_b\\_a",`
