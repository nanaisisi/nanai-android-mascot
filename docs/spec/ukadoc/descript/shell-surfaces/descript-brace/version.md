# version,\*

- **規格**: [version.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell-surfaces/descript-brace/version/) (ukadoc-spec/descript/shell-surfaces/descript-brace/version.md)
- **検索語**: version
- **対応状況**: ⚠️ 一部対応 (Rust パーサー `crates/ui/src/surfaces.rs` で解析・データ化実装済 / 描画・実行への反映は別レイヤー)

## 突合結果

ヒットしたのは一般的な語「version」の無関係な出現。該当の仕様に対応する処理は確認できない。

## 実装箇所
- `crates/ui/src/surfaces.rs` （Rust 版 surfaces.txt パーサー：Element / Collision / SERIKO / Alias / append の解析）

- `src-tauri/src/shiori/cpp.rs:26`  `fn yaya_get_version() -> *const c_char;`
- `src-tauri/src/shiori/cpp.rs:162`  `pub fn get_version() -> Result<String, String> {`
- `src-tauri/src/shiori/cpp.rs:164`  `let version_ptr = yaya_get_version();`
- `src-tauri/src/shiori/cpp.rs:165`  `if version_ptr.is_null() {`
- `src-tauri/src/shiori/cpp.rs:166`  `return Err("Failed to get YAYA version".to_string());`
