# \_b[ファイルパス,inline]

- **規格**: [_b-inline.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/balloon-text/_b-inline/)
- **検索語**: \_b
- **対応状況**: ⚠️ 一部対応

## 突合結果

`\_b[...]` (InlineBitmap) タグのパース処理を実装 (`crates/ui/src/script/parser/brackets/handlers/underscore.rs`)。


## 実装箇所

- `crates/ui/src/script/command.rs:23` `}, // \_b[...]`
- `crates/ui/src/script/parser/tests.rs:94` `\\_b[surface0.png,inline,10,20,opaque]\`
- `crates/ui/src/script/parser/brackets/mod.rs:227` `"a[id]text\\_b\\_a",`
