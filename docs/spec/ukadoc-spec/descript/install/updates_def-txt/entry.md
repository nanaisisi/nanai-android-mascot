# 相対パス,ignore

- **規格**: [entry.md](https://ukatech.shillest.net/ukadoc-spec/descript/install/updates_def-txt/entry/) (ukadoc-spec/descript/install/updates_def-txt/entry.md)
- **検索語**: ignore
- **対応状況**: ⚠️ 一部対応

## 突合結果

`crates/ui/src/update.rs` (`parse_update_definition`) においてネットワーク更新定義 (`updates_def.txt` / `updates2.dau`) 内の相対パス行および `ignore`, `readonly`, `delete`, `size=` オプションフラグを自動解析・処理する実装が行われている。

## 実装箇所

- `src-tauri/src/ghost/scan/directory/mod.rs:63` `println!("🚫 Skipping ghost directory with ignore file: {:?}", path);`
- `crates/ui/src/update/types.rs:28` `self.flags.iter().any(|f| f.eq_ignore_ascii_case("ignore"))`
- `crates/ui/src/update/parser/update_definition.rs:65` `} else if extra_trimmed.eq_ignore_ascii_case("ignore") {`
- `crates/ui/src/update/parser/update_definition.rs:67` `option_flags.push("ignore".to_string());`
- `crates/ui/src/update/tests/definition_package.rs:90` `assert_eq!(entries[0].flags, vec!["ignore", "readonly", "delete"]);`
