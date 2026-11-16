# system.power.(キー)

- **規格**: [system.power.md](https://ukatech.shillest.net/ukadoc-spec/list/propertysystem/property-system/system.power/) (ukadoc-spec/list/propertysystem/property-system/system.power.md)
- **検索語**: system.power.
- **対応状況**: ✅ 実装済

## 突合結果

UKADOC `system.power` 仕様に従い、`source` (`ac` / `battery` / `ups` / `unknown`), `battery.percent`, `battery.lifetime`, `battery.flag` (`high`, `low`, `critical`, `charging`, `no_battery`) を Win32 `GetSystemPowerStatus` および Linux/Android `/sys/class/power_supply/battery` から完全に動的算出・評価するよう完全実装。

## 実装箇所

- `src-tauri/src/shiori/property/evaluator/rules/system_hardware.rs` `pub fn evaluate_system_power(q: &str)`
- `src-tauri/src/shiori/property/tests.rs` `evaluate_property_query("system.power.source")`
