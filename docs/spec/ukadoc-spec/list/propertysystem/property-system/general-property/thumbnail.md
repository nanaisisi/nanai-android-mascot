# thumbnail

- **規格**: [thumbnail.md](https://ukatech.shillest.net/ukadoc-spec/list/propertysystem/property-system/general-property/thumbnail/)
- **検索語**: thumbnail
- **対応状況**: ❌ 検出なし

## 突合結果

実装コード内に「thumbnail」を確認。


## 実装箇所

- `crates/ui/src/descript/parser.rs:171` `entry.thumbnail = parts.next().filter(|s| !s.is_empty()).map(str::to_string);`
- `crates/ui/src/descript/tests.rs:33` `assert_eq!(g.thumbnail.as_deref(), Some("thumb.png"));`
- `crates/ui/src/descript/types.rs:31` `pub thumbnail: Option<String>,`
- `ui/js/core/actions/ghost-actions.js:156` `/** @type {{ number: number; part: string; thumbnail?: string | null; on: boolea`
- `ui/js/surface/bind-menu.js:6` `* thumbnail/default/add_ids）と descript `bindoption.group` を`
