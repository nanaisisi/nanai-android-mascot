# 相対パス,ignore

- **規格**: [entry.md](https://ukatech.shillest.net/ukadoc-spec/descript/install/updates_def-txt/entry/) (ukadoc-spec/descript/install/updates_def-txt/entry.md)
- **検索語**: ignore
- **対応状況**: ✅ 対応済

## 突合結果

`crates/ui/src/update.rs` (`parse_update_definition`) においてネットワーク更新定義 (`updates_def.txt` / `updates2.dau`) 内の相対パス行および `ignore`, `readonly`, `delete`, `size=` オプションフラグを自動解析・処理する実装が行われている。

## 実装箇所

- `crates/ui/src/update.rs` `// [相対パス,ignore], [補足]: updates_def.txt / updates2.dau における相対パス指定...`
