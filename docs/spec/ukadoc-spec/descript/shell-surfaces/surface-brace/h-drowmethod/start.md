# start,ID

- **規格**: [start.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell-surfaces/surface-brace/h-animationinterval/start/) (ukadoc-spec/descript/shell-surfaces/surface-brace/h-animationinterval/start.md)
- **検索語**: start
- **対応状況**: ✅ 実装済


## 実装箇所

- `src-tauri/build.rs:20` `if !target.contains("windows") || !target.starts_with("x86_64") {`
- `src-tauri/src/commands/web.rs:13` `if lower.starts_with("ukagaka://install") || lower.starts_with("ghost://install"`
- `src-tauri/src/commands/web.rs:23` `} else if (lower.starts_with("ukagaka://sstp") || lower.starts_with("sstp://"))`
- `src-tauri/src/commands/web.rs:43` `assert!(uri.starts_with("ukagaka://install"));`
- `src-tauri/src/commands/ext.rs:29` `if !dir_name.starts_with('.') {`
