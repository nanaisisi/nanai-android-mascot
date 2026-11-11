# vertical,0/1

- **規格**: [vertical.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/) (ukadoc-spec/descript/balloon/descript-txt/vertical.md)
- **検索語**: vertical
- **対応状況**: ✅ 実装済

## 突合結果

バルーンテキストの描画において、CSS writing-mode または縦書き表示制御に対応。

## 実装箇所

- `src-tauri/src/shiori/property/tests.rs:91` `evaluate_property_query("currentghost.balloon.scope(0).vertical"),`
- `src-tauri/src/shiori/property/evaluator/dynamic_rules.rs:54` `"vertical" => "0".to_string(),`
- `ui/css/balloon-window.css:111` `vertical-align: middle;`
- `ui/css/balloon-window.css:233` `vertical-align: middle;`
- `ui/css/balloon-window.css:256` `vertical-align: middle;`
