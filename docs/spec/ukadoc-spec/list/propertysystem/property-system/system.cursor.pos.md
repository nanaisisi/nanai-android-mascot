# system.cursor.pos

- **規格**: [system.cursor.pos.md](https://ukatech.shillest.net/ukadoc-spec/list/propertysystem/property-system/system.cursor.pos/) (ukadoc-spec/list/propertysystem/property-system/system.cursor.pos.md)
- **検索語**: system.cursor.pos
- **対応状況**: ✅ 実装済

## 突合結果

UKADOC `system.cursor.pos` 仕様に従い、Win32 `GetCursorPos` からリアルタイムのマウスカーソルスクリーン座標 (X,Y ピクセル) を動的取得・算出するよう完全実装。

## 実装箇所

- `src-tauri/src/shiori/property/evaluator/rules/system.rs` `fn get_mouse_cursor_pos()`
- `src-tauri/src/shiori/property/tests.rs` `evaluate_property_query("system.cursor.pos")`
