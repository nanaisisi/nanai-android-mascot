# log_path

- **規格**: [log_path.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-resource/shiori/log_path/) (ukadoc-spec/list/shiori-resource/shiori/log_path.md)
- **検索語**: log_path
- **対応状況**: ❌ 検出なし

## 突合結果

実装コード内に「log_path」を確認。

## 実装箇所

- `src-tauri/src/shiori/ffi/builder.rs:179` `pub fn on_update_result_explorer(status: &str, log_path: Option<&str>) -> Self {`
- `src-tauri/src/shiori/ffi/builder.rs:185` `if let Some(path) = log_path {`
