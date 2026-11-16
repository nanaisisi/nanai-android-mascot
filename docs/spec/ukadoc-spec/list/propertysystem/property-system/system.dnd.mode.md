# system.dnd.mode

- **規格**: [system.dnd.mode.md](https://ukatech.shillest.net/ukadoc-spec/list/propertysystem/property-system/system.dnd.mode/) (ukadoc-spec/list/propertysystem/property-system/system.dnd.mode.md)
- **検索語**: system.dnd.mode
- **対応状況**: ✅ 実装済

## 突合結果

UKADOC 仕様に従い、`quiet` (有効/集中モード時) または `normal` (無効時) を Win32 Registry FocusAssist 状態から完全に動的解決するよう実装。

## 実装箇所

- `src-tauri/src/shiori/property/evaluator/rules/system_os.rs` `pub fn get_system_dnd_mode()`
- `src-tauri/src/shiori/property/tests.rs` `evaluate_property_query("system.dnd.mode")`
