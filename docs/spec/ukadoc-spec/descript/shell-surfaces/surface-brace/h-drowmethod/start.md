# start,ID

- **規格**: [start.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell-surfaces/surface-brace/h-animationinterval/start/) (ukadoc-spec/descript/shell-surfaces/surface-brace/h-animationinterval/start.md)
- **検索語**: start
- **対応状況**: ⚠️ 一部対応


## 実装箇所

- `src-tauri/src/shiori/headline.rs:43` `let start = s + start_tag.len();`
- `src-tauri/src/shiori/headline.rs:44` `if let Some(e) = block[start..].find(&end_tag) {`
- `src-tauri/src/shiori/headline.rs:45` `let content = &block[start..start + e];`
- `src-tauri/src/shiori/headline.rs:58` `let start = s + gt + 1;`
- `src-tauri/src/shiori/headline.rs:59` `if let Some(e) = block[start..].find(&end_tag) {`
