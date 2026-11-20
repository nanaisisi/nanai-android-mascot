# thumbnail

- **規格**: [thumbnail.md](https://ukatech.shillest.net/ukadoc-spec/list/propertysystem/property-system/general-property/thumbnail/)
- **検索語**: thumbnail
- **対応状況**: ⚠️ 一部対応

## 突合結果

実装コード内に「thumbnail」を確認。

## 実装箇所

- `crates/ui/src/descript/tests.rs:33` `assert_eq!(g.thumbnail(), Some("thumb.png"));`
- `src-tauri/src/commands/shell/balloon.rs:11` `thumbnail: Option<String>,`
- `ui/ts/surface/bind-menu.ts:14` `thumbnail?: string | null;`
- `ui/ts/ui/modal-ghost-handlers.ts:213` `const thumbHtml = b.thumbnail`
- `crates/ui/src/descript/types.rs:59` `pub(crate) thumbnail: Option<String>,`
- `src-tauri/src/commands/shell/balloon.rs:27` `pub fn thumbnail(&self) -> Option<&str> {`
