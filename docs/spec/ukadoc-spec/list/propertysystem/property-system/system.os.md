# system.os.(キー)

- **規格**: [system.os.md](https://ukatech.shillest.net/ukadoc-spec/list/propertysystem/property-system/system.os/) (ukadoc-spec/list/propertysystem/property-system/system.os.md)
- **検索語**: system.os.
- **対応状況**: ✅ 実装済

## 突合結果

UKADOC `system.os` 仕様に従い全 15 キー（`type`, `arch`, `name`, `version`, `build`, `parenttype`, `parentname`, `locale`, `locale.language`, `locale.country`, `timezone.offset`, `dst`, `uptime`, `unixtime`, `idletime`）をシステムの標準関数・`sys_locale`・`chrono`・`GetTickCount64` / `/proc/uptime` から完全に動的算出・評価するよう実装。

## 実装箇所

- `src-tauri/src/shiori/property/evaluator/dynamic_rules.rs` `if let Some(sub) = q.strip_prefix("system.os.")`
- `src-tauri/src/shiori/property/tests.rs` `evaluate_property_query("system.os.name")`
