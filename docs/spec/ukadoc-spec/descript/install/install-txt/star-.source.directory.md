# \*.source.directory,ディレクトリ名

- **規格**: [star-.source.directory.md](https://ukatech.shillest.net/ukadoc-spec/descript/install/install-txt/star-.source.directory/) (ukadoc-spec/descript/install/install-txt/star-.source.directory.md)
- **検索語**: .source.directory
- **対応状況**: ❌ 検出なし

## 突合結果

実装コード内に「.source.directory」を確認。


## 実装箇所

- `src-tauri/src/commands/install/archive.rs:63` `if let Some(val) = map.get("balloon.source.directory") {`
