# bind

- **規格**: [bind.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell-surfaces/surface-brace/h-animationinterval/bind/) (ukadoc-spec/descript/shell-surfaces/surface-brace/h-animationinterval/bind.md)
- **検索語**: bind
- **対応状況**: ⚠️ 一部対応


## 実装箇所

- `src-tauri/src/shiori/property/tests.rs:50` `assert_eq!(evaluate_property_query("sakura.bind.menu"), "");`
- `src-tauri/src/shiori/property/tests.rs:51` `assert_eq!(evaluate_property_query("kero.bind.menu"), "");`
- `src-tauri/src/shiori/property/evaluator/static_rules.rs:72` `"sakura.bind.menu" => "",`
- `src-tauri/src/shiori/property/evaluator/static_rules.rs:73` `"kero.bind.menu" => "",`
- `crates/ui/src/manifest.rs:118` `"charset,Shift_JIS\nsurface0\n{\nelement0,base,surface0.png,0,0\ncollisionex0,he`
