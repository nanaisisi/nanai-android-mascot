# 相対パス,ignore

- **規格**: [entry.md](https://ukatech.shillest.net/ukadoc-spec/descript/install/updates_def-txt/entry/) (ukadoc-spec/descript/install/updates_def-txt/entry.md)
- **検索語**: ignore
- **対応状況**: ✅ 実装済

## 突合結果

`crates/ui/src/update/parser/update_definition.rs` (`parse_update_definition`) および `crates/ui/src/update/types.rs` (`is_ignored`) において `updates_def.txt` 内の「相対パス,ignore」および各種オプションフラグ (`readonly`, `delete`, `size=`) のパース・判定が完全実装済み。

## 実装箇所

- `crates/ui/src/update/parser/update_definition.rs` (`parse_update_definition`)
- `crates/ui/src/update/types.rs` (`is_ignored`)
