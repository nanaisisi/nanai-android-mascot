# version

- **規格**: [version.md](https://ukatech.shillest.net/ukadoc-spec/list/plugin-event/plugin-event/version/) (ukadoc-spec/list/plugin-event/plugin-event/version.md)
- **検索語**: version
- **対応状況**: 🔎 コード上に出現(処理の有無は要読解)

## 突合結果

実装コードに「version」が出現。実際の処理内容は未精査。

## 実装箇所

- `src-tauri/src/shiori/cpp.rs:26`  `fn yaya_get_version() -> *const c_char;`
- `src-tauri/src/shiori/cpp.rs:162`  `pub fn get_version() -> Result<String, String> {`
- `src-tauri/src/shiori/cpp.rs:164`  `let version_ptr = yaya_get_version();`
- `src-tauri/src/shiori/cpp.rs:165`  `if version_ptr.is_null() {`
- `src-tauri/src/shiori/cpp.rs:166`  `return Err("Failed to get YAYA version".to_string());`
