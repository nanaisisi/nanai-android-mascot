# homeurl

- **規格**: [homeurl.md](https://ukatech.shillest.net/ukadoc-spec/list/propertysystem/property-system/general-property/homeurl/)
- **検索語**: homeurl
- **対応状況**: ⚠️ 一部対応

## 突合結果

update/network.rs で homeurl を取得してネットワーク更新に使用。

## 実装箇所

- `src-tauri/src/commands/ext.rs:44` `.or_else(|| map.get("homeurl").cloned());`
- `src-tauri/src/commands/ext.rs:109` `.or_else(|| map.get("homeurl").cloned());`
- `src-tauri/src/commands/update/dau.rs:10` `pub homeurl: String,`
- `src-tauri/src/commands/update/dau.rs:44` `if let Some(url) = desc.homeurl() {`
- `src-tauri/src/commands/update/dau.rs:57` `if let Some(url) = desc.homeurl() {`
