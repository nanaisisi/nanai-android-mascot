# 補足

- **規格**: [note-1.md](https://ukatech.shillest.net/ukadoc-spec/descript/install/updates_def-txt/note-1/) (ukadoc-spec/descript/install/updates_def-txt/note-1.md)
- **検索語**: 補足
- **対応状況**: ✅ 対応済

## 突合結果

`crates/ui/src/update.rs` において `updates_def.txt` の各種拡張属性・補足オプション（`size`, `ignore`, `readonly`, `delete` 等）の互換処理が行われている。

## 実装箇所

- `crates/ui/src/update.rs` `// [相対パス,ignore], [補足]: updates_def.txt / updates2.dau における相対パス指定...`
