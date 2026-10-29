# scope,数値

- **規格**: [scope.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell-surfacetable/surfacetable-txt/scope/) (ukadoc-spec/descript/shell-surfacetable/surfacetable-txt/scope.md)
- **検索語**: scope
- **対応状況**: ✅ 実装済 (Rust パーサー `crates/ui/src/surfacetable.rs` で解析・データ化済 / 表示側は別レイヤー)

## 突合結果

surface-parser.js / surface-animation-manager.js に該当の解析・処理は確認できない。

## 実装箇所

- `src-tauri/src/commands/window/character_window.rs:6` `scope_id: i32,`
- `src-tauri/src/commands/window/character_window.rs:17` `let label = format!("subchar_window_{}", scope_id);`
- `src-tauri/src/commands/window/character_window.rs:32` `let (mut target_x, mut target_y) = if scope_id == 0 {`
- `src-tauri/src/commands/window/character_window.rs:35` `(200.0 + (scope_id as f64 * 220.0), 200.0)`
- `src-tauri/src/commands/window/character_window.rs:39` `if scope_id > 0`
