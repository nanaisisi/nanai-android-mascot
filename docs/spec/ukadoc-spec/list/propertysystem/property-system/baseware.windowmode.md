# baseware.windowmode

- **規格**: [baseware.windowmode.md](https://ukatech.shillest.net/ukadoc-spec/list/propertysystem/property-system/baseware.windowmode/) (ukadoc-spec/list/propertysystem/property-system/baseware.windowmode.md)
- **検索語**: baseware.windowmode
- **対応状況**: ✅ 実装済

## 突合結果

`baseware.windowmode` プロパティの評価を UKADOC 仕様に従い、通常デスクトップウィンドウモード (`normal`) またはコンテナモード (`shared`, `perghost`) で正しく評価・動的出力するよう実装。

## 実装箇所

- `src-tauri/src/shiori/property/evaluator/rules/baseware.rs` `pub fn evaluate_baseware_property(sub: &str)`
- `src-tauri/src/shiori/property/tests.rs` `evaluate_property_query("baseware.windowmode")`
