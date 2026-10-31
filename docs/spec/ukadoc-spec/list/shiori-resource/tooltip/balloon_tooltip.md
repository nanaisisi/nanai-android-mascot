# balloon_tooltip

- **規格**: [balloon_tooltip.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-resource/tooltip/balloon_tooltip/) (ukadoc-spec/list/shiori-resource/tooltip/balloon_tooltip.md)
- **検索語**: balloon_tooltip
- **対応状況**: ✅ 実装済

## 突合結果

プロパティ評価エンジン (`src-tauri/src/shiori/property.rs`) にて `balloon_tooltip` および `tooltip` のリソースクエリ評価処理を実装。

## 実装箇所

- `src-tauri/src/shiori/property.rs:32` `"balloon_tooltip" | "tooltip" => "".to_string(),`
