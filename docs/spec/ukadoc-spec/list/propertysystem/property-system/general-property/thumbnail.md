# thumbnail

- **規格**: [thumbnail.md](https://ukatech.shillest.net/ukadoc-spec/list/propertysystem/property-system/general-property/thumbnail/)
- **検索語**: thumbnail
- **対応状況**: ❌ 検出なし

## 突合結果

実装コード内に「thumbnail」を確認。

## 実装箇所

- `src-tauri/src/commands/shell/balloon.rs:10` `pub thumbnail: Option<String>,`
- `src-tauri/src/commands/shell/balloon.rs:34` `let thumbnail = ["thumbnail.png", "thumbnail.jpg", "thumbnail.bmp"]`
- `src-tauri/src/commands/shell/balloon.rs:54` `thumbnail,`
- `crates/ui/src/descript/parser.rs:171` `entry.thumbnail = parts.next().filter(|s| !s.is_empty()).map(str::to_string);`
- `crates/ui/src/descript/tests.rs:33` `assert_eq!(g.thumbnail.as_deref(), Some("thumb.png"));`
