# thumbnail

- **規格**: [thumbnail.md](https://ukatech.shillest.net/ukadoc-spec/list/propertysystem/property-system/general-property/thumbnail/)
- **検索語**: thumbnail
- **対応状況**: ⚠️ 一部対応

## 突合結果

実装コード内に「thumbnail」を確認。

## 実装箇所

- `src-tauri/src/commands/shell/balloon.rs:10` `pub thumbnail: Option<String>,`
- `src-tauri/src/commands/shell/balloon.rs:35` `let thumbnail = ["thumbnail.png", "thumbnail.jpg", "thumbnail.bmp"]`
- `src-tauri/src/commands/shell/balloon.rs:67` `thumbnail,`
- `crates/ui/src/descript/tests.rs:33` `assert_eq!(g.thumbnail.as_deref(), Some("thumb.png"));`
- `crates/ui/src/descript/types.rs:31` `pub thumbnail: Option<String>,`
