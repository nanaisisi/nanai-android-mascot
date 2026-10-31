# さくらスクリプトのエスケープ

- **規格**: [notes_escape.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/notes_escape/)
- **検索語**: notes_escape.md
- **対応状況**: ✅ 実装済

## 突合結果

さくらスクリプトのエスケープ文字（`\\`, `\%` 等）および解説仕様文書。パーサ (`crates/ui/src/script/parser/mod.rs`) にてエスケープ文字の復元処理を実装。

## 実装箇所

- `crates/ui/src/script/parser/mod.rs`
