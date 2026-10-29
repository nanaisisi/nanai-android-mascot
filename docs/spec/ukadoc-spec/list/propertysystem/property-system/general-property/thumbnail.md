# thumbnail

- **規格**: [thumbnail.md](https://ukatech.shillest.net/ukadoc-spec/list/propertysystem/property-system/general-property/thumbnail/)
- **検索語**: thumbnail
- **対応状況**: ❌ 検出なし

## 突合結果

実装コード内に「thumbnail」を確認。


## 実装箇所

- `crates/ui/src/descript.rs:32` `pub thumbnail: Option<String>,`
- `crates/ui/src/descript.rs:205` `entry.thumbnail = parts.next().filter(|s| !s.is_empty()).map(str::to_string);`
- `crates/ui/src/descript.rs:254` `assert_eq!(g.thumbnail.as_deref(), Some("thumb.png"));`
- `ui/js/surface/bind-menu.js:6` `* thumbnail/default/add_ids）と descript `bindoption.group` を`
- `ui/js/surface/bind-menu.js:19` `* @returns {Array<{ number: number, category: string, part: string, thumbnail?: `
