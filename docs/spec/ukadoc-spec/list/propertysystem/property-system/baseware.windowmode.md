# baseware.windowmode

- **規格**: [baseware.windowmode.md](https://ukatech.shillest.net/ukadoc-spec/list/propertysystem/property-system/baseware.windowmode/) (ukadoc-spec/list/propertysystem/property-system/baseware.windowmode.md)
- **検索語**: baseware.windowmode
- **対応状況**: ⚠️ 一部対応

## 突合結果

`baseware.windowmode` プロパティの評価を UKADOC 仕様に従い、通常デスクトップウィンドウモード (`normal`) またはコンテナモード (`shared`, `perghost`) で正しく評価・動的出力するよう実装。

## 実装箇所

- `src-tauri/src/shiori/property/tests.rs:23` `assert_eq!(evaluate_property_query("baseware.windowmode"), "normal");`
