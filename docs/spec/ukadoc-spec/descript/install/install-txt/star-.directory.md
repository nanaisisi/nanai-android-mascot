# \*.directory,ディレクトリ名

- **規格**: [star-.directory.md](https://ukatech.shillest.net/ukadoc-spec/descript/install/install-txt/star-.directory/) (ukadoc-spec/descript/install/install-txt/star-.directory.md)
- **検索語**: .directory
- **対応状況**: ❌ 検出なし

## 突合結果

実装コード内に「.directory」を確認。


## 実装箇所

- `src-tauri/src/commands/install/archive.rs:60` `if let Some(val) = map.get("balloon.directory") {`
- `src-tauri/src/commands/install/archive.rs:63` `if let Some(val) = map.get("balloon.source.directory") {`
- `crates/ui/src/shell.rs:102` `.unwrap_or_else(|| self.directory_name())`
- `crates/ui/src/shell.rs:132` `resolve_vfs_path(&self.directory, relative)`
- `crates/ui/src/shell.rs:137` `self.directory`
