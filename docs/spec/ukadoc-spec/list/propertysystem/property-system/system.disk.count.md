# system.disk.count

- **規格**: [system.disk.count.md](https://ukatech.shillest.net/ukadoc-spec/list/propertysystem/property-system/system.disk.count/) (ukadoc-spec/list/propertysystem/property-system/system.disk.count.md)
- **検索語**: system.disk.count
- **対応状況**: ✅ 実装済

## 突合結果

UKADOC `system.disk` 仕様に従い、全論理ドライブ数（`system.disk.count`）および各ドライブの属性 (`mountpoint`, `type`, `total`, `free`) を Win32 `GetLogicalDriveStringsW` / `GetDriveTypeW` / `GetDiskFreeSpaceExW` および Unix `libc::statvfs` から完全に動的評価するよう実装。

## 実装箇所

- `src-tauri/src/shiori/property/evaluator/rules/system_hardware.rs` `pub fn get_system_disks()`
- `src-tauri/src/shiori/property/tests.rs` `evaluate_property_query("system.disk.count")`
