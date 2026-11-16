# system.cpu.(キー)

- **規格**: [system.cpu.md](https://ukatech.shillest.net/ukadoc-spec/list/propertysystem/property-system/system.cpu/) (ukadoc-spec/list/propertysystem/property-system/system.cpu.md)
- **検索語**: system.cpu.
- **対応状況**: ✅ 実装済

## 突合結果

`system.cpu.num`, `system.cpu.name`, `system.cpu.vendor`, `system.cpu.load`, `system.cpu.clock`, `system.cpu.features` をシステム情報 (`std::thread::available_parallelism()`, `std::env::consts::ARCH`) から動的取得・評価するよう完全実装。

## 実装箇所

- `src-tauri/src/shiori/property/evaluator/dynamic_rules.rs` `if let Some(sub) = q.strip_prefix("system.cpu.")`
- `src-tauri/src/shiori/property/tests.rs` `evaluate_property_query("system.cpu.name")`
