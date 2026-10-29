# descriptブレス記述例

- **規格**: [introduction_descriptbrace.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell-surfaces/descript-brace/introduction_descriptbrace/) (ukadoc-spec/descript/shell-surfaces/descript-brace/introduction_descriptbrace.md)
- **検索語**: descript
- **対応状況**: ⚠️ 一部対応 (Rust パーサー `crates/ui/src/surfaces.rs` で解析・データ化実装済 / 描画・実行への反映は別レイヤー)

## 突合結果

ヒットしたのは一般的な語「descript」の無関係な出現。該当の仕様に対応する処理は確認できない。

## 実装箇所

- `src-tauri/src/commands/ext.rs:4` `use crate::ghost::scan::read_descript_file;`
- `src-tauri/src/commands/ext.rs:30` `let desc_path = path.join("descript.txt");`
- `src-tauri/src/commands/ext.rs:31` `if let Some(map) = read_descript_file(&desc_path) {`
- `src-tauri/src/commands/ext.rs:36` `let description = map.get("description").cloned();`
- `src-tauri/src/commands/ext.rs:44` `description,`
